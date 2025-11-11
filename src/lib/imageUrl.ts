/**
 * Get the full URL for an image
 * Handles both relative URLs (from local storage) and absolute URLs (from Cloudinary)
 */
export function getImageUrl(photoUrl: string): string {
  // If it's already an absolute URL (from Cloudinary), return as-is
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl;
  }

  // For relative URLs, construct the full backend URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const baseUrl = apiUrl.replace('/api', '');
  return `${baseUrl}${photoUrl}`;
}
