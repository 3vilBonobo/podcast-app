export function listeningProgress(position: number, duration: number): number {
  return Number.isFinite(position) && Number.isFinite(duration) && duration > 0
    ? Math.max(0, Math.min(100, Math.round((position / duration) * 100)))
    : 0;
}
