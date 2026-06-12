export function getSafeImageUrl(image?: string | null, title?: string): string {
  if (image && (image.startsWith("http") || image.startsWith("data:image"))) return image;
  // Fallback to Unsplash if empty or invalid
  const query = encodeURIComponent(title || "travel");
  return `https://source.unsplash.com/featured/?${query}`;
}
