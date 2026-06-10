import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/berita", "/berita/"],
      disallow: ["/dashboard", "/login", "/api/"],
    },
  }
}
