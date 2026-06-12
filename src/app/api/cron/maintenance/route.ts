import { NextRequest, NextResponse } from "next/server";
import { runBackup, runOrphanCleanup } from "@/lib/maintenance";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const authHeader = request.headers.get("authorization");
    const token = authHeader ? authHeader.replace("Bearer ", "") : null;
    
    const expectedSecret = process.env.CRON_SECRET || "super-secure-cron-secret-key-12345";
    
    if (key !== expectedSecret && token !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Token autentikasi tidak valid." },
        { status: 401 }
      );
    }

    console.log("Starting cron maintenance task...");
    const backupResult = await runBackup();
    const cleanupResult = await runOrphanCleanup();

    return NextResponse.json({
      success: true,
      message: "Pemeliharaan berhasil dijalankan",
      backup: backupResult,
      cleanup: cleanupResult
    });
  } catch (error: any) {
    console.error("Cron maintenance error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menjalankan pemeliharaan" },
      { status: 500 }
    );
  }
}
