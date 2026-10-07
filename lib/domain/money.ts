const integerAmountPattern = /^\d+$/

export function parseXofDisplayAmount(value: string): number {
  const normalized = value

    .trim()

    .replace(/\s*(?:FCFA|XOF)$/i, "")

    .replace(/[\s\u00a0\u202f]/g, "")

  if (!integerAmountPattern.test(normalized)) {
    throw new TypeError(`Montant XOF invalide : "${value}".`)
  }

  const amount = Number(normalized)

  if (!Number.isSafeInteger(amount)) {
    throw new RangeError(`Montant XOF hors limites : "${value}".`)
  }

  return amount
}

export function formatXofAmount(amount: number): string {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new RangeError("Un montant XOF doit être un entier positif ou nul.")
  }

  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(amount)
}

export function splitAmountIntoInstallments(
  amount: number,

  installmentCount: number,
): number[] {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new RangeError(
      "Le montant à répartir doit être un entier positif ou nul.",
    )
  }

  if (!Number.isSafeInteger(installmentCount) || installmentCount < 1) {
    throw new RangeError("Le nombre de tranches doit être un entier positif.")
  }

  const baseAmount = Math.floor(amount / installmentCount)

  const remainder = amount % installmentCount

  return Array.from(
    { length: installmentCount },

    (_, index) => baseAmount + (index < remainder ? 1 : 0),
  )
}
