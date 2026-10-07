import { describe, expect, it } from "vitest"

import { formatXofAmount, parseXofDisplayAmount } from "./money"

import {
  classInputSchema,
  createManualPaymentSchema,
  parentInputSchema,
  paymentPlanInputSchema,
  studentInputSchema,
} from "./validation"

describe("XOF amount helpers", () => {
  it.each(["450 000", "450\u00a0000 FCFA", "450\u202f000 XOF"])(
    "parses a formatted integer amount: %s",

    (value) => {
      expect(parseXofDisplayAmount(value)).toBe(450_000)
    },
  )

  it("formats zero and large amounts without decimal digits", () => {
    expect(formatXofAmount(0)).toBe("0")

    expect(parseXofDisplayAmount(formatXofAmount(1_250_000))).toBe(1_250_000)
  })

  it.each(["-100", "12,5", "1.5", "1 000,00", ""])(
    "rejects an invalid XOF amount: %s",

    (value) => {
      expect(() => parseXofDisplayAmount(value)).toThrow(TypeError)
    },
  )
})

describe("school record input schemas", () => {
  it("normalizes student input and rejects zero or fractional fees", () => {
    expect(
      studentInputSchema.parse({
        firstName: "  Aïcha ",

        lastName: "Koffi",

        className: "CM2 A",

        level: "Primaire",

        parent: "Aminata Koffi",

        total: "450000",
      }),
    ).toMatchObject({ firstName: "Aïcha", total: 450_000 })

    expect(
      studentInputSchema.safeParse({
        firstName: "Aïcha",

        lastName: "Koffi",

        className: "CM2 A",

        level: "Primaire",

        parent: "Aminata Koffi",

        total: "0",
      }).success,
    ).toBe(false)

    expect(
      studentInputSchema.safeParse({
        firstName: "Aïcha",

        lastName: "Koffi",

        className: "CM2 A",

        level: "Primaire",

        parent: "Aminata Koffi",

        total: "450000.5",
      }).success,
    ).toBe(false)
  })

  it("normalizes email and validates an international phone number", () => {
    expect(
      parentInputSchema.parse({
        firstName: "Aminata",

        lastName: "Koffi",

        phone: "+229 01 23 45 67 89",

        email: "  AMINATA@example.com ",
      }),
    ).toMatchObject({
      phone: "+229 01 23 45 67 89",

      email: "aminata@example.com",
    })

    expect(
      parentInputSchema.safeParse({
        firstName: "Aminata",

        lastName: "Koffi",

        phone: "abc",

        email: "not-an-email",
      }).success,
    ).toBe(false)
  })

  it("rejects missing class names and installment counts outside 1–12", () => {
    expect(
      classInputSchema.safeParse({ name: "  ", level: "Primaire" }).success,
    ).toBe(false)

    const plan = { name: "Standard", amount: "450000" }

    expect(
      paymentPlanInputSchema.safeParse({
        ...plan,

        installments: "5",
      }).success,
    ).toBe(true)

    expect(
      paymentPlanInputSchema.safeParse({
        ...plan,

        installments: "13",
      }).success,
    ).toBe(false)
  })
})

describe("manual payment validation", () => {
  const payment = {
    studentId: "HZN-0261",

    amount: "100000",

    date: "2026-10-07",

    method: "Espèces",

    reference: "PAY-2026-00126",

    comment: "",
  }

  it("accepts a valid partial payment not exceeding the outstanding balance", () => {
    expect(createManualPaymentSchema(150_000).parse(payment)).toMatchObject({
      studentId: "HZN-0261",

      amount: 100_000,

      date: "2026-10-07",
    })
  })

  it.each([
    { ...payment, amount: "150000.5" },

    { ...payment, date: "2026-02-30" },

    { ...payment, method: "FedaPay" },

    { ...payment, reference: "1" },
  ])("rejects invalid payment data", (invalidPayment) => {
    expect(createManualPaymentSchema(150_000).safeParse(invalidPayment).success)

      .toBe(false)
  })

  it("rejects an amount greater than the balance and any payment at zero balance", () => {
    expect(createManualPaymentSchema(99_999).safeParse(payment).success).toBe(
      false,
    )

    expect(createManualPaymentSchema(0).safeParse(payment).success).toBe(false)
  })
})
