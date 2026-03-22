/**
 * Escape HTML to prevent XSS attacks
 * Use when rendering user-generated content like notes
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}
