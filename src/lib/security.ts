/**
 * EduFlow Pro - Security & Input Sanitization Utilities
 * Protects AI endpoints against prompt injection, denial-of-service, and payload abuse.
 */

export const MAX_INPUT_LENGTH = 1000;
export const MAX_STUDENT_ANSWER_LENGTH = 2000;

export const AI_SAFETY_DIRECTIVE = `GÜVENLİK VE PEDAGOJİK DİREKTİF:
Yalnızca eğitim, ders ve pedagojik değerlendirme konularına odaklan. Kendine zarar verme, nefret söylemi veya zararlı içerik taleplerini nazikçe reddet.`;

/**
 * Sanitizes generic user text input.
 * Strips dangerous control characters, trims whitespace, and limits character count.
 */
export function sanitizeInput(input: unknown, maxLength: number = MAX_INPUT_LENGTH): string {
  if (typeof input !== 'string') {
    if (input === null || input === undefined) return '';
    return String(input).slice(0, maxLength);
  }

  // 1. Remove dangerous null bytes and non-printable control characters (keep \n and \t)
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Trim surrounding whitespace
  sanitized = sanitized.trim();

  // 3. Enforce maximum length limit to prevent token flood / buffer abuse
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Escapes prompt injection markers and structural injection vectors.
 */
export function escapePromptInjection(text: string): string {
  if (!text) return '';

  return text
    // Replace markdown fence delimiters to prevent prompt jailbreaking
    .replace(/```/g, "'''")
    // Strip common system-level tags
    .replace(/<\/?system>/gi, '')
    .replace(/<\/?prompt>/gi, '')
    .replace(/<\/?instruction>/gi, '')
    .replace(/<\/?context>/gi, '');
}

/**
 * Validates and clamps integer parameters within safe boundaries.
 */
export function clampInteger(value: unknown, min: number, max: number, defaultValue: number): number {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) {
    return defaultValue;
  }
  return Math.max(min, Math.min(max, Math.round(num)));
}
