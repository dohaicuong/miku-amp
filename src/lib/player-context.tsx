import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AudioTrack } from "./library";
import { clearPlaybackState, savePlaybackState } from "./library-storage";

export type RepeatMode = "off" | "all" | "one";

// How often to write the current `t` to IndexedDB while playing. 1 s
// matches the audio element's own `timeupdate` cadence — a refresh
// resumes within at most one second of where the user actually was.
const PROGRESS_PERSIST_INTERVAL_MS = 1000;

/*
 * Single-track playback driver. Owns one persistent `HTMLAudioElement` for
 * the whole app lifetime so playback survives route changes; mounted
 * exactly once via `<PlayerProvider>` at the route tree root.
 *
 * `playTrack(track)` resolves the file from the track's handle, swaps the
 * audio element's src to a blob URL, and starts playback. The previous
 * track's blob URL is revoked before the new one lands so we don't leak
 * across tracks.
 *
 * Future surface (deferred): a queue / next-track behaviour. For now
 * `playTrack` is the only way new audio enters the player; "ended" stops
 * playback rather than auto-advancing.
 */
type PlayerContextValue = {
  current: AudioTrack | null;
  // Track list driving prev/next navigation. Set by the caller when they
  // initiate playback (library passes the current folder's `tracks`).
  // `playNext` / `playPrev` walk this by handle identity.
  queue: AudioTrack[];
  playing: boolean;
  progressSec: number;
  durationSec: number;
  // True while the FullPlayer overlay is showing — controlled state lifted
  // here so the MiniPlayer's expand button and the FullPlayer's collapse
  // chevron talk through the same source of truth.
  expanded: boolean;
  // Repeat mode. "off" = stop at end of queue. "all" = wrap queue. "one"
  // = single-track loop (driven by the audio element's native `loop`).
  repeat: RepeatMode;
  // Shuffle on/off. Toggling rearranges the active `queue` (Fisher-Yates,
  // current track pinned to idx 0); the original order is preserved
  // internally and restored when toggled back off.
  shuffle: boolean;
  // `seekTo` restores at a specific offset (used by the route on first
  // mount when the URL carries a `?t=` param). `queue` sets a fresh
  // playback queue at the same time. `keepQueue` preserves the existing
  // queue when stepping inside it (used by `playNext` / `playPrev`).
  playTrack: (
    track: AudioTrack,
    options?: { seekTo?: number; queue?: AudioTrack[]; keepQueue?: boolean },
  ) => Promise<void>;
  // Step through the current queue. Wrap at the boundaries when
  // `repeat === "all"`; no-op at the boundaries when `repeat === "off"`.
  playNext: () => void;
  playPrev: () => void;
  togglePlayPause: () => void;
  seek: (sec: number) => void;
  stop: () => void;
  // Cycle off → all → one → off.
  cycleRepeat: () => void;
  toggleShuffle: () => void;
  expand: () => void;
  collapse: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<AudioTrack | null>(null);
  const [queue, setQueue] = useState<AudioTrack[]>([]);
  const [playing, setPlaying] = useState(false);
  const [progressSec, setProgressSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [shuffle, setShuffle] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Last blob URL handed to the audio element; revoked when superseded so
  // we don't accumulate one decoded copy per track played.
  const blobUrlRef = useRef<string | null>(null);
  // Mirrors of `current` and `queue` so the audio element's `ended` event
  // handler — registered once at mount — reads the latest state without
  // closing over stale React snapshots.
  const currentRef = useRef<AudioTrack | null>(null);
  const queueRef = useRef<AudioTrack[]>([]);
  const repeatRef = useRef<RepeatMode>("off");
  const shuffleRef = useRef(false);
  // Original (un-shuffled) queue order. Kept aside while shuffle is on so
  // toggling off restores the source order rather than re-randomising into
  // yet another permutation.
  const originalQueueRef = useRef<AudioTrack[]>([]);
  // Ref to the latest `playNext` so the `ended` listener auto-advances
  // through the live queue without rebinding the listener each render.
  const playNextRef = useRef<() => void>(() => {});
  useEffect(() => {
    currentRef.current = current;
  }, [current]);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);
  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  // Wire repeat="one" through to the audio element's native `loop` flag.
  // When loop is true the browser handles seamless restart and `ended`
  // simply doesn't fire — no manual currentTime reset needed.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = repeat === "one";
  }, [repeat]);

  // Lazy-create the element on first render. Guarded for SSR / non-DOM
  // contexts even though this app is client-only — cheaper than a useEffect
  // bootstrap, and the element has no visual presence.
  if (audioRef.current === null && typeof Audio !== "undefined") {
    audioRef.current = new Audio();
    audioRef.current.preload = "auto";
  }

  // Wire React state to the audio element's events. One-time setup —
  // listeners are stable for the element's lifetime.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setProgressSec(audio.currentTime);
    const onMeta = () => setDurationSec(audio.duration);
    const onEnded = () => {
      setPlaying(false);
      setProgressSec(0);
      // Auto-advance through the queue via a ref so this listener (set up
      // once at mount) always reads the latest playNext.
      playNextRef.current();
    };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  // Provider lives at the route tree root, so this cleanup typically
  // fires on full app teardown — except under HMR, when Vite swaps the
  // module and the old PlayerProvider unmounts while a new one mounts.
  // Without explicitly pausing + clearing src here the orphaned audio
  // element from the previous module instance keeps playing alongside
  // the new one, stacking a fresh audio source on every save.
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const playTrack = useCallback(
    async (
      track: AudioTrack,
      options: { seekTo?: number; queue?: AudioTrack[]; keepQueue?: boolean } = {},
    ) => {
      const audio = audioRef.current;
      if (!audio) return;
      try {
        const file = await track.handle.getFile();
        // Revoke the prior URL *after* we have the new file in hand so a
        // failure mid-load doesn't leave the element with a dead src.
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        const url = URL.createObjectURL(file);
        blobUrlRef.current = url;
        audio.src = url;
        // If the caller wants to start mid-track (URL-restored playback),
        // wait until the audio knows its duration before assigning
        // currentTime. Setting it before metadata is parsed silently
        // resolves to 0 in some browsers.
        if (options.seekTo && options.seekTo > 0) {
          const seekTo = options.seekTo;
          audio.addEventListener(
            "loadedmetadata",
            () => {
              audio.currentTime = seekTo;
            },
            { once: true },
          );
        }
        // Queue handling:
        //  - explicit `queue` → replace (and reshuffle if shuffle is on)
        //  - `keepQueue` → preserve (used by playNext / playPrev)
        //  - neither → single-track queue so prev/next no-op cleanly
        if (options.queue) {
          originalQueueRef.current = options.queue;
          setQueue(shuffleRef.current ? shuffleAroundCurrent(options.queue, track) : options.queue);
        } else if (!options.keepQueue) {
          originalQueueRef.current = [track];
          setQueue([track]);
        }
        setCurrent(track);
        await audio.play();
      } catch (err) {
        console.warn("[miku-amp] playTrack:", err);
      }
    },
    [],
  );

  const playNext = useCallback(() => {
    const queue = queueRef.current;
    const current = currentRef.current;
    if (!current || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.handle === current.handle);
    if (idx < 0) return;
    let nextIdx = idx + 1;
    if (nextIdx >= queue.length) {
      // Wrap to the start when looping the queue; otherwise stop here.
      if (repeatRef.current !== "all") return;
      nextIdx = 0;
    }
    void playTrack(queue[nextIdx], { keepQueue: true });
  }, [playTrack]);

  const playPrev = useCallback(() => {
    const queue = queueRef.current;
    const current = currentRef.current;
    if (!current || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.handle === current.handle);
    if (idx < 0) return;
    let prevIdx = idx - 1;
    if (prevIdx < 0) {
      if (repeatRef.current !== "all") return;
      prevIdx = queue.length - 1;
    }
    void playTrack(queue[prevIdx], { keepQueue: true });
  }, [playTrack]);

  const cycleRepeat = useCallback(() => {
    setRepeat((prev) => (prev === "off" ? "all" : prev === "all" ? "one" : "off"));
  }, []);

  // Toggling shuffle re-derives the active queue from the original (un-
  // shuffled) order: turning on randomises with current pinned at idx 0
  // so what's playing keeps playing; turning off restores source order.
  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => {
      const next = !prev;
      const original = originalQueueRef.current;
      const current = currentRef.current;
      if (next) {
        setQueue(shuffleAroundCurrent(original, current));
      } else {
        setQueue(original);
      }
      return next;
    });
  }, []);

  // Keep the ref pointed at the latest playNext so the `ended` listener
  // (which fires from a stable closure registered once at mount) walks
  // the live queue rather than a stale snapshot.
  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  }, []);

  const seek = useCallback((sec: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = sec;
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.removeAttribute("src");
    audio.load();
    setCurrent(null);
    setQueue([]);
    setProgressSec(0);
    setDurationSec(0);
    setExpanded(false);
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const expand = useCallback(() => setExpanded(true), []);
  const collapse = useCallback(() => setExpanded(false), []);

  // Persistence: stash the current track's full path in IndexedDB on every
  // track change so a refresh resumes playback from where it stopped. The
  // `rootId` rides along so we know which library to find the track in
  // when multiple are registered. We keep this off the URL because each
  // navigate({ replace: true }) was bouncing the library scroll position
  // back to the top.
  const prevTrackRef = useRef<AudioTrack | null>(null);
  useEffect(() => {
    if (current === prevTrackRef.current) return;
    prevTrackRef.current = current;
    if (!current) {
      void clearPlaybackState();
      return;
    }
    const trackPath = [...current.folderPath, current.filename].join("/");
    void savePlaybackState({ rootId: current.rootId, trackPath, t: 0 });
  }, [current]);

  // Throttled progress sync: while playing, write `audio.currentTime` to
  // IndexedDB every second. The interval clears on pause / track change /
  // unmount.
  useEffect(() => {
    if (!current || !playing) return;
    const audio = audioRef.current;
    if (!audio) return;
    const rootId = current.rootId;
    const trackPath = [...current.folderPath, current.filename].join("/");
    const id = window.setInterval(() => {
      void savePlaybackState({ rootId, trackPath, t: Math.floor(audio.currentTime) });
    }, PROGRESS_PERSIST_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [current, playing]);

  return (
    <PlayerContext.Provider
      value={{
        current,
        queue,
        playing,
        progressSec,
        durationSec,
        expanded,
        repeat,
        shuffle,
        playTrack,
        playNext,
        playPrev,
        togglePlayPause,
        seek,
        stop,
        cycleRepeat,
        toggleShuffle,
        expand,
        collapse,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer must be used inside <PlayerProvider>");
  }
  return ctx;
}

// Fisher-Yates shuffle. Returns a new array; doesn't mutate the input.
function shuffleArray<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Shuffle the queue around the current track — current sits at idx 0,
// the rest of the queue lands in random order after it. Falls back to a
// plain shuffle when there's no current track or it isn't in the queue.
function shuffleAroundCurrent(queue: AudioTrack[], current: AudioTrack | null): AudioTrack[] {
  if (!current) return shuffleArray(queue);
  const idx = queue.findIndex((t) => t.handle === current.handle);
  if (idx < 0) return shuffleArray(queue);
  const rest = [...queue.slice(0, idx), ...queue.slice(idx + 1)];
  return [current, ...shuffleArray(rest)];
}
