export function getContrastColor(hexColor: string) {
  // If no color provided, default to white text (for the default green)
  if (!hexColor) return '#ffffff';
  
  // Remove hash if present
  const hex = hexColor.replace('#', '');
  
  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate relative luminance (per W3C guidelines)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // If luminance is high (light color), return dark text. Otherwise return white text.
  return luminance > 0.6 ? '#1A1A1A' : '#ffffff';
}
