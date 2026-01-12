/**
 * Input sanitization utilities for production security
 */

export function sanitizeString(input: string, maxLength?: number): string {
  if (typeof input !== "string") {
    return "";
  }

  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, "");

  // Trim whitespace
  sanitized = sanitized.trim();

  // Apply length limit if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

export function sanitizeEmail(email: string): string {
  return sanitizeString(email.toLowerCase().trim(), 254); // RFC 5321 max email length
}

export function sanitizeUrl(url: string): string {
  const sanitized = sanitizeString(url.trim(), 2048); // Common URL length limit

  // Basic URL validation
  try {
    const parsed = new URL(sanitized);
    // Only allow http/https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Invalid protocol");
    }
    return sanitized;
  } catch {
    throw new Error("Invalid URL format");
  }
}

export function sanitizeSlug(slug: string): string {
  // Only allow lowercase letters, numbers, and hyphens
  return sanitizeString(slug.toLowerCase().replace(/[^a-z0-9-]/g, ""), 50);
}
