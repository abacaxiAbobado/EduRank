/**
 * Sanitização básica para prevenir XSS.
 * Remove tags HTML e scripts maliciosos de strings.
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Valida se uma URL é segura (http/https) e retorna true/false.
 */
function isUrlSegura(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitiza um objeto recursivamente (apenas strings).
 */
function sanitizeObj(obj) {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObj);
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const key of Object.keys(obj)) {
      result[key] = sanitizeObj(obj[key]);
    }
    return result;
  }
  return obj;
}

module.exports = { sanitizeString, isUrlSegura, sanitizeObj };
