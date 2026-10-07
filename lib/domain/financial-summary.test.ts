import { describe, expect, it } from "vitest"

import {
  summarizePaymentsByMonth,
  summarizePaymentsByMethod,
  summarizeStudents,
} from "./financial-summary"

import type { PaymentRecord, StudentRecord } from "../mock-data"

const student = (
  id: string,

  level: string,

  total: string,

  paid: string,
): StudentRecord => ({
  id,

  level,

  total,

  paid,

  remaining: "ignored: derived from total and paid",

  firstName: "Test",

  lastName: id,

  className: "Classe",

  parent: "Parent test",

  status: "À suivre",
})

describe("student financial summaries", () => {
  it("reconciles expected, collected, remaining, collection rate, and levels", () => {
    const summary = summarizeStudents([
      student("A", "Maternelle", "300 000", "100 000"),

      student("B", "Primaire", "450 000", "450 000"),

      student("C", "Primaire", "250 000", "50 000"),
    ])

    expect(summary).toMatchObject({
      studentCount: 3,

      expected: 1_000_000,

      collected: 600_000,

      outstanding: 400_000,

      collectionRate: 60,

      studentsWithBalance: 2,
    })

    expect(summary.expected).toBe(summary.collected + summary.outstanding)

    expect(summary.levels).toEqual([
      {
        level: "Maternelle",

        expected: 300_000,

        collected: 100_000,

        outstanding: 200_000,

        collectionRate: 33.3,
      },

      {
        level: "Primaire",

        expected: 700_000,

        collected: 500_000,

        outstanding: 200_000,

        collectionRate: 71.4,
      },

      {
        level: "Secondaire",

        expected: 0,

        collected: 0,

        outstanding: 0,

        collectionRate: 0,
      },
    ])
  })

  it("returns zeroed totals for an empty data set", () => {
    expect(summarizeStudents([])).toMatchObject({
      studentCount: 0,

      expected: 0,

      collected: 0,

      outstanding: 0,

      collectionRate: 0,

      studentsWithBalance: 0,
    })
  })

  it("surfaces inconsistent records instead of hiding an overpayment", () => {
    expect(() =>
      summarizeStudents([student("OVERPAID", "Primaire", "100", "150")]),
    ).toThrow(RangeError)
  })
})

describe("payment method summaries", () => {
  const payment = (
    method: string,

    amount: string,
  ): PaymentRecord => ({
    method,

    amount,

    date: "07 oct. 2026",

    student: "Élève test",

    reference: `PAY-${method}-${amount}`,

    status: "Payé",
  })

  it("groups the visible payment history and calculates its method shares", () => {
    expect(
      summarizePaymentsByMethod([
        payment("Espèces", "100 000 FCFA"),
        payment("Espèces", "50 000 FCFA"),
        payment("Virement", "50 000 FCFA"),
        { ...payment("Mobile Money", "250 000 FCFA"), status: "En attente" },
      ]),
    ).toEqual([
      { method: "Espèces", amount: 150_000, paymentCount: 2, share: 75 },

      { method: "Virement", amount: 50_000, paymentCount: 1, share: 25 },
    ])
  })

  it("returns no categories when no payments exist", () => {
    expect(summarizePaymentsByMethod([])).toEqual([])
  })
})

describe("monthly payment summaries", () => {
  const through = new Date("2026-10-07T12:00:00.000Z")
  const payment = (
    amount: string,
    date: string,
    dateISO?: string,
    status = "Payé",
  ): PaymentRecord => ({
    method: "Espèces",
    amount,
    date,
    dateISO,
    student: "Élève test",
    reference: `PAY-${amount}-${date}`,
    status,
  })

  it("aggregates confirmed payments into the six-month chart window", () => {
    expect(
      summarizePaymentsByMonth(
        [
          payment("100 000 FCFA", "02 sept. 2026", "2026-09-02"),
          payment("75 000 FCFA", "18 août 2026"),
          payment("50 000 FCFA", "05 août 2026"),
          payment("200 000 FCFA", "02 oct. 2026", "2026-10-02"),
          payment("900 000 FCFA", "02 oct. 2026", "2026-10-02", "En attente"),
          payment("50 000 FCFA", "02 févr. 2026", "2026-02-02"),
        ],
        6,
        through,
      ),
    ).toEqual([
      { month: "2026-05", period: "mai", amount: 0, paymentCount: 0 },
      { month: "2026-06", period: "juin", amount: 0, paymentCount: 0 },
      { month: "2026-07", period: "juil.", amount: 0, paymentCount: 0 },
      { month: "2026-08", period: "août", amount: 125_000, paymentCount: 2 },
      { month: "2026-09", period: "sept.", amount: 100_000, paymentCount: 1 },
      { month: "2026-10", period: "oct.", amount: 200_000, paymentCount: 1 },
    ])
  })

  it("skips invalid and out-of-range dates without losing valid entries", () => {
    expect(
      summarizePaymentsByMonth(
        [
          payment("100 FCFA", "Date invalide", "2026-99-40"),
          payment("50 FCFA", "07 oct. 2026", "2026-10-07"),
        ],
        1,
        through,
      ),
    ).toEqual([
      { month: "2026-10", period: "oct.", amount: 50, paymentCount: 1 },
    ])
  })

  it("rejects unsupported period lengths and invalid reference dates", () => {
    expect(() => summarizePaymentsByMonth([], 0, through)).toThrow(RangeError)
    expect(() => summarizePaymentsByMonth([], 6, new Date("invalid"))).toThrow(
      RangeError,
    )
  })
})
