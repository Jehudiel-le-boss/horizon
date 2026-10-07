import { describe, expect, it } from "vitest"

import { splitAmountIntoInstallments } from "./money"

describe("installment amount allocation", () => {
  it("splits the individual student's total without losing or adding XOF", () => {
    const installments = splitAmountIntoInstallments(500_000, 3)

    expect(installments).toEqual([166_667, 166_667, 166_666])

    expect(installments.reduce((total, value) => total + value, 0)).toBe(
      500_000,
    )
  })

  it("supports a zero total and rejects invalid inputs", () => {
    expect(splitAmountIntoInstallments(0, 1)).toEqual([0])

    expect(() => splitAmountIntoInstallments(100, 0)).toThrow(RangeError)

    expect(() => splitAmountIntoInstallments(-1, 2)).toThrow(RangeError)
  })
})
