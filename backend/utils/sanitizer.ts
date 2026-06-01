/**
 * Utility for input sanitization, XSS protection, and dynamic click links parsing.
 */

/**
 * Escapes raw HTML formatting characters to completely prevent XSS injections.
 */
export function escapeHTML(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates a text-based URL and screens for malicious patterns such as "javascript:" or "data:".
 * If validation fails, returns null. If it succeeds, returns the clean string.
 */
export function validateUrl(urlStr: string): string | null {
  try {
    const trimmed = urlStr.trim();
    // Block any scripts or non-web schemas
    if (/^(javascript:|data:|vbscript:)/i.test(trimmed)) {
      return null;
    }
    // Simple verification that it is a URL format
    if (!/^https?:\/\//i.test(trimmed)) {
      return null; // Force http/https only
    }
    // Attempt parse
    new URL(trimmed);
    return trimmed;
  } catch {
    return null;
  }
}

/**
 * Detects all raw HTTP/HTTPS URLs inside a text block and converts them into
 * safe, functional HTML anchor links with target="_blank" and rel="noopener noreferrer".
 * Encodes other contents to prevent XSS.
 */
export function parseAndConvertUrls(text: string): string {
  if (!text) return '';

  // First, we escape the HTML completely to prevent XSS
  const escapedText = escapeHTML(text);

  // Regex to look for URLs in the escaped text.
  // Escaped text will have https?://... intact since we didn't escape those characters.
  const urlRegex = /(https?:\/\/[^\s<"';]+)/gi;

  return escapedText.replace(urlRegex, (match) => {
    // Decode any entity that could be in the URL portion to validate it safely
    const decodedUrl = match.replace(/&amp;/g, '&');
    const valid = validateUrl(decodedUrl);
    if (valid) {
      return `<a href="${valid}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline dark:text-blue-400 font-medium">${valid}</a>`;
    }
    return match; // If unsafe/invalid, return escaped string as plain text
  });
}
