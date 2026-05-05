import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { asset } from "@/lib/asset";

// Sprite-frame counts per animation. Frames are PNGs at
// `/public/animated-icons/<name>/<name><NN>.png` with NN zero-padded from 01.
// Adding a new animation means dropping the frames into a new subdir and
// extending this map (the type union and prop typing follow automatically).
const FRAME_COUNTS = {
  angry: 5,
  bye: 14,
  cry: 12,
  def: 18,
  dev: 1,
  dizzy: 19,
  drink: 33,
  eatcake: 15,
  excited: 8,
  fall: 9,
  hairflip: 5,
  heart: 10,
  hello: 10,
  jump: 8,
  lift: 12,
  listenmusic: 4,
  notlistenmusic: 23,
  punching: 10,
  question: 7,
  rolling: 15,
  rotate: 10,
  search: 1,
  shy: 16,
  sleep: 14,
  watch: 8,
} as const;

export type AnimatedIconName = keyof typeof FRAME_COUNTS;
export const ANIMATED_ICON_NAMES = Object.keys(FRAME_COUNTS) as AnimatedIconName[];

const pad2 = (n: number) => n.toString().padStart(2, "0");

const frameUrl = (name: AnimatedIconName, idx: number) =>
  asset(`animated-icons/${name}/${name}${pad2(idx + 1)}.png`);

// Module-level dedup set: a frame URL only ever gets `new Image()`'d once.
// On the previous "all 23 in a grid" example this was 23 instances × ~13
// frames = a 285-request burst per page load, which froze the page under
// repeated refreshes — that example has been removed. With the picker
// pattern (one mounted icon at a time) the preload is bounded to a single
// animation's frame count (4–33), worth doing so the first cycle plays
// smoothly instead of popping.
const preloadedFrames = new Set<string>();

function preloadAnimation(name: AnimatedIconName, total: number) {
  for (let i = 0; i < total; i++) {
    const url = frameUrl(name, i);
    if (preloadedFrames.has(url)) continue;
    preloadedFrames.add(url);
    const img = new Image();
    img.src = url;
  }
}

// Shared requestAnimationFrame loop for ALL AnimatedIcon instances. Replaces
// per-component setInterval (which on the doc grid was 23 independent timers
// + 23 closures, recreated on every re-render that touched the effect deps).
// One rAF, N subscribers — much friendlier to fast-refresh thrash.
type FrameTick = (now: number) => void;
const tickSubscribers = new Set<FrameTick>();
let rafId: number | null = null;

function loopOnce(now: number) {
  for (const tick of tickSubscribers) tick(now);
  rafId = tickSubscribers.size > 0 ? requestAnimationFrame(loopOnce) : null;
}

function subscribeTick(tick: FrameTick): () => void {
  tickSubscribers.add(tick);
  if (rafId === null) rafId = requestAnimationFrame(loopOnce);
  return () => {
    tickSubscribers.delete(tick);
  };
}

type AnimatedIconProps = {
  name: AnimatedIconName;
  // Frames per second. 12 reads naturally for the chibi cels — most sit in
  // the 10–15 fps band before the motion starts to feel jittery (low) or
  // floaty (high).
  fps?: number;
  // When false, the animation freezes on the current frame.
  playing?: boolean;
  // When false, the animation halts on the last frame instead of restarting.
  loop?: boolean;
  // Fires once on the transition into the final frame of a non-looping
  // animation. Use for one-shots like a `bye` farewell that triggers UI.
  onComplete?: () => void;
  // Optional alt text. Defaults to "" (treats the icon as decoration). Set
  // an explicit string when the animation conveys state to AT users.
  alt?: string;
  // Sizing is the caller's responsibility — `className="w-32 aspect-square"`
  // or whatever fits the surface.
  className?: string;
};

export function AnimatedIcon({
  name,
  fps = 10,
  playing = true,
  loop = true,
  onComplete,
  alt = "",
  className,
}: AnimatedIconProps) {
  const total = FRAME_COUNTS[name];
  // Frame index lives in a ref so ticking the animation doesn't trigger a
  // React re-render — we mutate `imgRef.current.src` imperatively each frame
  // instead. Drops 23 icon × `fps` Hz of churn on the doc grid to zero.
  const idxRef = useRef(0);
  const imgRef = useRef<HTMLImageElement | null>(null);
  // Sticky "we already finished" flag for non-looping animations. Without it,
  // if the parent re-renders with a new `onComplete` lambda, the tick
  // subscription would re-run and could re-fire onComplete on the next tick.
  // Reset on `name` change so a fresh animation gets to play through.
  const completedRef = useRef(false);
  // Latest `onComplete` lambda kept in a ref so the tick subscription doesn't
  // need to depend on it — react-live re-evaluates preview blocks on every
  // edit, generating fresh lambdas; if those landed in the deps they'd
  // re-subscribe the tick on every save and accumulate work fast.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reset to frame 0 when the animation changes, push the first frame into
  // the DOM immediately, and preload the rest of the sequence so the first
  // cycle plays smoothly. Preload is deduped at module scope — a given URL
  // only triggers `new Image()` once per session.
  useEffect(() => {
    idxRef.current = 0;
    completedRef.current = false;
    if (imgRef.current) imgRef.current.src = frameUrl(name, 0);
    preloadAnimation(name, total);
  }, [name, total]);

  // Subscribe to the shared rAF loop. Each tick checks whether enough time
  // has passed for the next frame at the configured `fps`, advances the ref,
  // and writes the new URL onto the <img> imperatively. Single-frame entries
  // (`dev`, `search`) are effectively static — skip the subscription so we
  // don't re-paint the same src every `1000/fps` ms for nothing.
  useEffect(() => {
    if (!playing || completedRef.current || total <= 1) return;
    const frameInterval = 1000 / fps;
    let lastFrame = 0;
    const tick: FrameTick = (now) => {
      if (lastFrame === 0) {
        lastFrame = now;
        return;
      }
      if (now - lastFrame < frameInterval) return;
      lastFrame = now;

      const img = imgRef.current;
      const next = idxRef.current + 1;
      if (next < total) {
        idxRef.current = next;
        if (img) img.src = frameUrl(name, next);
        return;
      }
      if (loop) {
        idxRef.current = 0;
        if (img) img.src = frameUrl(name, 0);
        return;
      }
      idxRef.current = total - 1;
      completedRef.current = true;
      tickSubscribers.delete(tick);
      onCompleteRef.current?.();
    };
    return subscribeTick(tick);
  }, [playing, fps, total, loop, name]);

  return (
    <img
      ref={imgRef}
      src={frameUrl(name, 0)}
      alt={alt}
      draggable={false}
      className={cn("select-none", className)}
    />
  );
}
