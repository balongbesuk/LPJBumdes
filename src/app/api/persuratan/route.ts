import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET: Fetch all documents
export async function GET() {
  try {
    const documents = await db.document.findMany({
      orderBy: { date: "desc" }
    })
    return NextResponse.json({ success: true, data: documents })
  } catch (error: any) {
    console.error("Fetch documents error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch documents" },
      { status: 500 }
    )
  }
}

// POST: Register a new document
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { docNumber, type, subject, sender, recipient, date, fileUrl } = body

    if (!docNumber || !type || !subject) {
      return NextResponse.json(
        { success: false, error: "Nomor surat (docNumber), tipe surat, dan perihal (subject) harus diisi" },
        { status: 400 }
      )
    }

    // Check if docNumber already exists
    const existingDoc = await db.document.findUnique({
      where: { docNumber }
    })

    if (existingDoc) {
      return NextResponse.json(
        { success: false, error: `Nomor surat ${docNumber} sudah terdaftar di sistem. Harap gunakan nomor unik.` },
        { status: 400 }
      )
    }

    const docDate = date ? new Date(date) : new Date()

    const document = await db.document.create({
      data: {
        docNumber,
        type,
        subject,
        sender: type === "SURAT_MASUK" ? sender : null,
        recipient: type === "SURAT_KELUAR" ? recipient : null,
        date: docDate,
        fileUrl: fileUrl || null
      }
    })

    return NextResponse.json({ success: true, data: document })
  } catch (error: any) {
    console.error("Create document error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register document" },
      { status: 500 }
    )
  }
}
