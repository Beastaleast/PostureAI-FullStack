/** Format duration without hiding short sessions under a rounded "0m" label. */
export function formatDuration(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainder = safeSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return remainder > 0 ? `${minutes}m ${remainder}s` : `${minutes}m`;
  return `${remainder}s`;
}
