import { db } from "./db"

export async function getAccountBalance(accountCode: string): Promise<number> {
  const sums = await db.journalLine.groupBy({
    by: ['type'],
    where: { accountCode },
    _sum: { amount: true }
  })

  const account = await db.ledgerAccount.findUnique({
    where: { code: accountCode }
  })

  if (!account) return 0

  const debitSum = sums.find(s => s.type === "DEBIT")?._sum.amount || 0
  const creditSum = sums.find(s => s.type === "CREDIT")?._sum.amount || 0

  if (account.type === "ASSET" || account.type === "EXPENSE") {
    return debitSum - creditSum
  } else {
    return creditSum - debitSum
  }
}

export async function postJournalEntry(
  date: Date,
  description: string,
  unitUsaha: "SP" | "GEDUNG" | "LAHAN" | "PPOB" | "UMUM",
  lines: { accountCode: string; type: "DEBIT" | "CREDIT"; amount: number }[],
  attachmentUrl?: string | null
) {
  // Verify double entry balancing: sum of debits must equal sum of credits
  let debitTotal = 0
  let creditTotal = 0
  
  for (const line of lines) {
    if (line.type === "DEBIT") {
      debitTotal += line.amount
    } else {
      creditTotal += line.amount
    }
  }

  // To prevent floating point rounding issues, compare differences within 0.01 tolerance
  if (Math.abs(debitTotal - creditTotal) > 0.01) {
    throw new Error(`Jurnal tidak seimbang (debit: ${debitTotal}, kredit: ${creditTotal}). Selisih: ${Math.abs(debitTotal - creditTotal)}`)
  }

  return await db.$transaction(async (tx) => {
    const entry = await tx.journalEntry.create({
      data: {
        date,
        description,
        unitUsaha,
        attachmentUrl: attachmentUrl || null
      }
    })

    const createdLines = []
    for (const line of lines) {
      const dbLine = await tx.journalLine.create({
        data: {
          journalEntryId: entry.id,
          accountCode: line.accountCode,
          type: line.type,
          amount: line.amount
        }
      })
      createdLines.push(dbLine)
    }

    return { entry, lines: createdLines }
  })
}
