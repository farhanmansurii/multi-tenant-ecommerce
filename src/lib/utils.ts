import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatCurrency = (amount: number, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

export const sanitizeText = (text: string): string => {
  if (!text) return "";

  let cleanText = text.replace(/lorem ipsum/gi, "").trim();
  const repeatingSentenceRegex = /([^.!?]+[.!?]\s*)\1{2,}/gi;
  cleanText = cleanText.replace(repeatingSentenceRegex, (match, group1) => group1.trim());

  return cleanText;
};
