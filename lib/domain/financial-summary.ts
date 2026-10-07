import type { PaymentRecord, StudentRecord } from "../mock-data"

import { parseXofDisplayAmount } from "./money"

const schoolLevels = ["Maternelle", "Primaire", "Secondaire"] as const

export type LevelFinancialSummary = {
  level: string

  expected: number

  collected: number

  outstanding: number

  collectionRate: number
}

export type StudentFinancialSummary = {
  studentCount: number

  expected: number

  collected: number

  outstanding: number

  collectionRate: number

  studentsWithBalance: number

  levels: LevelFinancialSummary[]
}

export type PaymentMethodSummary = {
  method: string

  amount: number

  paymentCount: number

  share: number
}

export type MonthlyPaymentSummary = {
  month: string
  period: string
  amount: number
  paymentCount: number
}

type PaymentMethodTotals = {
  amount: number
  paymentCount: number
}

function parsePaymentDate(payment: PaymentRecord): Date | null {
  if (payment.dateISO) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payment.dateISO)) return null
    const date = new Date(`${payment.dateISO}T00:00:00.000Z`)
    if (Number.isNaN(date.valueOf())) return null
    return date.toISOString().slice(0, 10) === payment.dateISO ? date : null
  }

  const match = payment.date
    .trim()
    .toLocaleLowerCase("fr-FR")
    .match(/^(\d{1,2})\s+([a-zà-ÿ.]+)\s+(\d{4})$/u)
  if (!match) return null

  const month = match[2]
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replaceAll(".", "")
  const monthNumbers: Record<string, number> = {
    jan: 1,
    janv: 1,
    fev: 2,
    fevr: 2,
    mar: 3,
    mars: 3,
    avr: 4,
    avril: 4,
    mai: 5,
    juin: 6,
    juil: 7,
    juillet: 7,
    aou: 8,
    aout: 8,
    sep: 9,
    sept: 9,
    oct: 10,
    nov: 11,
    dec: 12,
    decem: 12,
  }
  const monthNumber = monthNumbers[month]
  if (!monthNumber) return null

  const dateISO = `${match[3]}-${String(monthNumber).padStart(2, "0")}-${match[1].padStart(2, "0")}`
  const date = new Date(`${dateISO}T00:00:00.000Z`)
  if (Number.isNaN(date.valueOf())) return null
  return date.toISOString().slice(0, 10) === dateISO ? date : null
}

function getCollectionRate(collected: number, expected: number): number {
  return expected === 0 ? 0 : Math.round((collected / expected) * 1000) / 10
}

export function summarizeStudents(
  students: readonly StudentRecord[],
): StudentFinancialSummary {
  const levelTotals = new Map<string, {
    expected: number
    collected: number
    outstanding: number
  }>(
    schoolLevels.map((level) => [
      level,
      { expected: 0, collected: 0, outstanding: 0 },
    ]),
  )

  let expected = 0

  let collected = 0

  let outstanding = 0

  let studentsWithBalance = 0

  for (const student of students) {
    const studentExpected = parseXofDisplayAmount(student.total)

    const studentCollected = parseXofDisplayAmount(student.paid)

    if (studentCollected > studentExpected) {
      throw new RangeError(
        `Les paiements de l’apprenant ${student.id} dépassent le total attendu.`,
      )
    }

    const studentOutstanding = studentExpected - studentCollected

    const level = levelTotals.get(student.level) ?? {
      expected: 0,

      collected: 0,

      outstanding: 0,
    }

    level.expected += studentExpected

    level.collected += studentCollected

    level.outstanding += studentOutstanding

    levelTotals.set(student.level, level)

    expected += studentExpected

    collected += studentCollected

    outstanding += studentOutstanding

    if (studentOutstanding > 0) studentsWithBalance += 1
  }

  const levels = [...levelTotals.entries()].map(([level, totals]) => ({
    level,

    ...totals,

    collectionRate: getCollectionRate(totals.collected, totals.expected),
  }))

  return {
    studentCount: students.length,

    expected,

    collected,

    outstanding,

    collectionRate: getCollectionRate(collected, expected),

    studentsWithBalance,

    levels,
  }
}

export function summarizePaymentsByMethod(
  payments: readonly PaymentRecord[],
): PaymentMethodSummary[] {
  const methods = new Map<string, PaymentMethodTotals>()

  let total = 0

  for (const payment of payments) {
    if (payment.status !== "Payé") continue

    const amount = parseXofDisplayAmount(payment.amount)

    const summary = methods.get(payment.method) ?? {
      amount: 0,
      paymentCount: 0,
    }

    summary.amount += amount

    summary.paymentCount += 1

    methods.set(payment.method, summary)

    total += amount
  }

  return [...methods.entries()].map(([method, summary]) => ({
    method,

    ...summary,

    share: total === 0 ? 0 : Math.round((summary.amount / total) * 1000) / 10,
  }))
}

export function summarizePaymentsByMonth(
  payments: readonly PaymentRecord[],
  months = 6,
  through = new Date(),
): MonthlyPaymentSummary[] {
  if (!Number.isInteger(months) || months < 1 || months > 36) {
    throw new RangeError("La période doit comprendre entre 1 et 36 mois.")
  }
  if (Number.isNaN(through.valueOf())) {
    throw new RangeError("La date de fin de période est invalide.")
  }

  const lastMonth = new Date(
    Date.UTC(through.getUTCFullYear(), through.getUTCMonth(), 1),
  )
  const firstMonth = new Date(lastMonth)
  firstMonth.setUTCMonth(firstMonth.getUTCMonth() - months + 1)

  const totals = new Map<string, MonthlyPaymentSummary>()
  for (let offset = 0; offset < months; offset += 1) {
    const monthDate = new Date(firstMonth)
    monthDate.setUTCMonth(firstMonth.getUTCMonth() + offset)
    const key = `${monthDate.getUTCFullYear()}-${String(monthDate.getUTCMonth() + 1).padStart(2, "0")}`
    totals.set(key, {
      month: key,
      period: new Intl.DateTimeFormat("fr-FR", {
        month: "short",
        timeZone: "UTC",
      }).format(monthDate),
      amount: 0,
      paymentCount: 0,
    })
  }

  for (const payment of payments) {
    if (payment.status !== "Payé") continue
    const date = parsePaymentDate(payment)
    if (!date) continue

    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
    const summary = totals.get(key)
    if (!summary) continue

    summary.amount += parseXofDisplayAmount(payment.amount)
    summary.paymentCount += 1
  }

  return [...totals.values()]
}
