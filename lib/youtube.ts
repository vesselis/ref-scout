/** Extract the 11-char video id from any common YouTube URL form, or null. */
export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Already a bare id.
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;

  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
    /(?:youtube\.com\/live\/)([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/** Build a privacy-enhanced embed URL for a given id and optional clip window. */
export function youtubeEmbedUrl(
  id: string,
  start?: number | null,
  end?: number | null,
): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (start && start > 0) params.set("start", String(start));
  if (end && start != null && end > start) params.set("end", String(end));
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
