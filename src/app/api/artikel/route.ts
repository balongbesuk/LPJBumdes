import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET: Fetch all articles
export async function GET() {
  try {
    const posts = await db.post.findMany({
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json({ success: true, data: posts })
  } catch (error: any) {
    console.error("Fetch posts error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch articles" },
      { status: 500 }
    )
  }
}

// POST: Create a new article
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, content, imageUrl, published } = body

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "Judul dan konten artikel harus diisi" },
        { status: 400 }
      )
    }

    const post = await db.post.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        published: published || false
      }
    })

    return NextResponse.json({ success: true, data: post })
  } catch (error: any) {
    console.error("Create post error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create article" },
      { status: 500 }
    )
  }
}
