import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function slugify(text: string): string {
  if (!text) return ""
  
  const lower = text.toLowerCase()
  let result = ""
  
  // Keep only alphanumeric characters, spaces, underscores, and hyphens
  for (let i = 0; i < lower.length; i++) {
    const char = lower[i]
    if (
      (char >= "a" && char <= "z") ||
      (char >= "0" && char <= "9") ||
      char === " " ||
      char === "_" ||
      char === "-"
    ) {
      result += char
    }
  }
  
  // Collapse multiple spaces/underscores/hyphens into a single hyphen
  let slug = ""
  let inSeparator = false
  
  for (let i = 0; i < result.length; i++) {
    const char = result[i]
    if (char === " " || char === "_" || char === "-") {
      if (!inSeparator) {
        slug += "-"
        inSeparator = true
      }
    } else {
      slug += char
      inSeparator = false
    }
  }
  
  // Trim leading/trailing hyphens
  if (slug.startsWith("-")) {
    slug = slug.substring(1)
  }
  if (slug.endsWith("-")) {
    slug = slug.slice(0, -1)
  }
  
  return slug
}
