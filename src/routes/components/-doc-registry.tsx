// The full pool of identifiers any component-doc markdown is allowed to use
// inside `tsx preview` blocks. Each markdown declares its own subset via a
// top-of-file ```scope ... ``` fence; <ComponentDoc> narrows this pool to
// that subset before passing to react-live. Common React hooks (useState,
// useEffect, …) are merged in by <ComponentDoc> and don't need to live here.
//
// Adding a new component doc:
//   1. Drop the markdown under `public/design-system/components/<slug>.md`
//      with a leading ```scope ... ``` listing the identifiers it uses.
//   2. If those identifiers aren't already imported here, add them.

import {
  BookmarkSimpleIcon,
  CaretRightIcon,
  FolderOpenIcon,
  GearIcon,
  InfoIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  MusicNotesIcon,
  PauseIcon,
  PlayIcon,
  PlaylistIcon,
  SunIcon,
  UserIcon,
  VinylRecordIcon,
  WarningIcon,
  WaveformIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Accordion } from "@/components/primitives/accordion";
import { Button } from "@/components/primitives/button";
import { Code } from "@/components/primitives/code";
import { Dialog } from "@/components/primitives/dialog";
import { Drawer } from "@/components/primitives/drawer";
import { EmptyState } from "@/components/primitives/empty-state";
import { IconButton } from "@/components/primitives/icon-button";
import { Input } from "@/components/primitives/input";
import { Knob } from "@/components/primitives/knob";
import { Menu } from "@/components/primitives/menu";
import { Progress } from "@/components/primitives/progress";
import { Skeleton } from "@/components/primitives/skeleton";
import { Slider } from "@/components/primitives/slider";
import { Switch } from "@/components/primitives/switch";
import { Tabs } from "@/components/primitives/tabs";
import { useToast } from "@/components/primitives/toast";
import { Tooltip } from "@/components/primitives/tooltip";
import { AlbumCard } from "@/components/features/album-card";
import { ArtistCard } from "@/components/features/artist-card";
import { BottomNav } from "@/components/features/bottom-nav";
import { CoverArt } from "@/components/features/cover-art";
import { FullPlayer } from "@/components/features/full-player";
import { LyricView } from "@/components/features/lyric-view";
import { MiniPlayer } from "@/components/features/mini-player";
import { TrackRow } from "@/components/features/track-row";
import type { DocScope } from "@/components/docs/component-doc";

export const docPool: DocScope = {
  // Primitives
  Accordion,
  Button,
  Code,
  Dialog,
  Drawer,
  EmptyState,
  IconButton,
  Input,
  Knob,
  Menu,
  Progress,
  Skeleton,
  Slider,
  Switch,
  Tabs,
  Tooltip,
  // Features
  AlbumCard,
  ArtistCard,
  BottomNav,
  CoverArt,
  FullPlayer,
  LyricView,
  MiniPlayer,
  TrackRow,
  // Hooks
  useToast,
  // Phosphor icons used by previews
  BookmarkSimpleIcon,
  CaretRightIcon,
  FolderOpenIcon,
  GearIcon,
  InfoIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  MusicNotesIcon,
  PauseIcon,
  PlayIcon,
  PlaylistIcon,
  SunIcon,
  UserIcon,
  VinylRecordIcon,
  WarningIcon,
  WaveformIcon,
  XIcon,
};
