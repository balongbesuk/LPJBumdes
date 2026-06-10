import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { slugify } from "@/lib/utils"

interface Params {
  params: Promise<{
    id: string
  }>
}

// PUT: Update an article
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, content, imageUrl, published } = body

    const post = await db.post.update({
      where: { id },
      data: {
        title,
        slug: title ? slugify(title) : undefined,
        content,
        imageUrl,
        published
      }
    })

    return NextResponse.json({ success: true, data: post })
  } catch (error: any) {
    console.error("Update post error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update article" },
      { status: 500 }
    )
  }
}

// DELETE: Delete an article
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params
    await db.post.delete({
      where: { id }
    })
    return NextResponse.json({ success: true, message: "Article deleted successfully" })
  } catch (error: any) {
    console.error("Delete post error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete article" },
      { status: 500 }
    )
  }
}
