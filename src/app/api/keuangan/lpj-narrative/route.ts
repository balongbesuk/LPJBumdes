import { getUserSession } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isPeriodLocked } from "@/lib/period-lock"
import { logActivity } from "@/lib/audit"
// Default templates for BUMDes LPJ narrative chapters (based on Permendesa No. 3/2021)
const DEFAULT_TEMPLATES = {
  bab1: "BUM Desa telah berhasil menjalankan berbagai program usaha selama tahun buku ini. Terjadi peningkatan efisiensi operasional dan pertumbuhan basis nasabah simpan pinjam serta perluasan penyewaan fasilitas gsg dan lapak warung.",
  bab2: "LAPORAN PELAKSANA OPERASIONAL (DIREKTUR):\nPelaksana operasional mengelola seluruh kegiatan harian, meningkatkan mutu pelayanan nasabah, serta melakukan digitalisasi pelaporan keuangan.\n\nLAPORAN BADAN PENGAWAS:\nBadan Pengawas secara periodik memeriksa catatan pembukuan bendahara, memantau tata kelola usaha, dan menyatakan bahwa kinerja keuangan berjalan sehat dan patuh regulasi.",
  bab3: "VISI & MISI BUM DESA:\nMenjadi motor penggerak perekonomian desa yang mandiri, transparan, dan menyejahterakan masyarakat.\n\nKEPEMILIKAN MODAL:\n1. Penyertaan Modal Awal Desa: Rp 100.000.000 (100%)\n\nDAFTAR SDM:\n- Direktur/Kepala BUMDes: [Nama Direktur]\n- Bendahara: [Nama Bendahara]\n- Sekretaris: [Nama Sekretaris]",
  bab4: "KONDISI SUMBER DAYA MANUSIA:\nSeluruh pengurus dan operator unit usaha aktif bekerja dan mengikuti pelatihan pembukuan keuangan desa.\n\nPERKEMBANGAN USAHA UNIT:\n1. Unit Simpan Pinjam: Meningkatnya penyaluran modal usaha kecil warga.\n2. Unit Sewa Gedung & Lahan: Tingkat hunian sewa stabil.\n3. Unit PPOB: Memberikan kemudahan pembayaran tagihan digital bagi warga.",
  bab5: "PERMASALAHAN OPERASIONAL:\n- Kurangnya kesadaran sebagian warga terkait disiplin pengembalian pinjaman tepat waktu.\n\nSTRATEGI PENYELESAIAN:\n- Melakukan pendekatan persuasif dan sosialisasi program kelompok pinjaman tanggung renteng.",
  bab6: "POTENSI DESA YANG DAPAT DIKEMBANGKAN:\n- Desa memiliki potensi pertanian/peternakan lokal yang tinggi untuk dikerjasamakan dengan BUMDes sebagai unit usaha perdagangan pakan atau pupuk di masa depan.",
  bab7: "TARGET KERJA & PROYEKSI TAHUN DEPAN:\n1. Penambahan nasabah simpan pinjam sebesar 20%.\n2. Pembukaan usaha perdagangan pakan ternak desa.\n3. Proyeksi peningkatan laba bersih operasional sebesar 15%.",
  bab8: "Demikian Laporan Pertanggungjawaban Tahunan ini disusun dengan penuh tanggung jawab untuk disahkan bersama dalam Musyawarah Desa (Musdes) sebagai bentuk keterbukaan informasi publik."
}

// GET: Fetch narrative by year
export async function GET(request: Request) {
  try {
    const session = await getUserSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get("year")
    if (!yearParam) {
      return NextResponse.json({ success: false, error: "Tahun buku harus ditentukan." }, { status: 400 })
    }

    const year = parseInt(yearParam, 10)

    const narrative = await db.lpjNarrative.findUnique({
      where: { year }
    })

    // Determine if the period is locked
    const isLocked = await isPeriodLocked(new Date(`${year}-12-31T23:59:59`))

    if (narrative) {
      return NextResponse.json({
        success: true,
        data: { ...narrative, isLocked }
      })
    } else {
      // Return default templates if not yet filled
      return NextResponse.json({
        success: true,
        data: {
          year,
          ...DEFAULT_TEMPLATES,
          isLocked
        }
      })
    }
  } catch (error: any) {
    console.error("Fetch LPJ narrative error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memuat narasi LPJ" },
      { status: 500 }
    )
  }
}

// POST: Save or update narrative by year
export async function POST(request: Request) {
  try {
    const session = await getUserSession()
    if (!session || (session.role !== "ADMIN" && session.role !== "BENDAHARA")) {
      return NextResponse.json(
        { success: false, error: "Hanya Kepala BUMDes dan Bendahara yang memiliki wewenang menyimpan LPJ" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { year, bab1, bab2, bab3, bab4, bab5, bab6, bab7, bab8 } = body

    if (!year) {
      return NextResponse.json({ success: false, error: "Tahun wajib ditentukan." }, { status: 400 })
    }

    const parsedYear = parseInt(year, 10)

    // Check if the year is already locked
    if (await isPeriodLocked(new Date(`${parsedYear}-12-31T23:59:59`))) {
      return NextResponse.json(
        { success: false, error: `Arsip LPJ tahun ${parsedYear} terkunci karena periode pembukuan tahun tersebut telah ditutup buku.` },
        { status: 400 }
      )
    }

    const narrative = await db.lpjNarrative.upsert({
      where: { year: parsedYear },
      update: {
        bab1,
        bab2,
        bab3,
        bab4,
        bab5,
        bab6,
        bab7,
        bab8
      },
      create: {
        year: parsedYear,
        bab1: bab1 || DEFAULT_TEMPLATES.bab1,
        bab2: bab2 || DEFAULT_TEMPLATES.bab2,
        bab3: bab3 || DEFAULT_TEMPLATES.bab3,
        bab4: bab4 || DEFAULT_TEMPLATES.bab4,
        bab5: bab5 || DEFAULT_TEMPLATES.bab5,
        bab6: bab6 || DEFAULT_TEMPLATES.bab6,
        bab7: bab7 || DEFAULT_TEMPLATES.bab7,
        bab8: bab8 || DEFAULT_TEMPLATES.bab8
      }
    })

    const actDetail = `Menyimpan draf narasi LPJ Tahunan BUMDes untuk Tahun Anggaran ${parsedYear}`
    await logActivity("SAVE_LPJ_NARRATIVE", actDetail, session)

    return NextResponse.json({
      success: true,
      message: "Draf laporan narasi pertanggungjawaban berhasil disimpan!",
      data: narrative
    })
  } catch (error: any) {
    console.error("Save LPJ narrative error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menyimpan draf narasi LPJ" },
      { status: 500 }
    )
  }
}
