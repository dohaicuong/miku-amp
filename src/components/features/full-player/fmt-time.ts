// `${m}:${ss}`, padded so 4 seconds reads as 0:04 not 0:4. Negative-clamping
// is the caller's job — this just renders whatever positive value lands in.
export function fmtTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
