import { runBackup, runOrphanCleanup } from "../src/lib/maintenance";
import { db } from "../src/lib/db";

async function main() {
  console.log("=== MEMULAI PROSES PEMELIHARAAN (MAINTENANCE) BUMDES ===");
  
  try {
    console.log("\n1. Menjalankan pencadangan database...");
    const backupResult = await runBackup();
    console.log(`   ✓ Berhasil mencadangkan database.`);
    console.log(`   - File cadangan: backups/${backupResult.backupFile}`);
    console.log(`   - Total file cadangan saat ini: ${backupResult.totalBackups}`);
    if (backupResult.deletedBackupsCount > 0) {
      console.log(`   - Menghapus ${backupResult.deletedBackupsCount} file cadangan lama.`);
    }
  } catch (error) {
    console.error("   ✗ Gagal menjalankan pencadangan database:", error);
  }

  try {
    console.log("\n2. Menjalankan pembersihan berkas sampah (orphan files)...");
    const cleanupResult = await runOrphanCleanup();
    console.log(`   ✓ Berhasil membersihkan berkas sampah.`);
    console.log(`   - Total berkas yang dihapus: ${cleanupResult.deletedFilesCount}`);
    if (cleanupResult.deletedFilesCount > 0) {
      console.log(`   - Berkas terhapus:`, cleanupResult.deletedFiles);
    }
  } catch (error) {
    console.error("   ✗ Gagal menjalankan pembersihan berkas sampah:", error);
  }

  console.log("\n=== PROSES PEMELIHARAAN SELESAI ===");
}

main()
  .then(async () => {
    await db.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
