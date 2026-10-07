import { z } from "zod"

const requiredText = (label: string, maxLength = 100) =>
  z.string()

    .trim()

    .min(1, `${label} est obligatoire.`)

    .max(maxLength, `${label} ne peut pas dépasser ${maxLength} caractères.`)

const positiveXofAmount = z

  .string()

  .trim()

  .regex(/^\d+$/, "Saisissez un montant entier en FCFA.")

  .transform(Number)

  .pipe(
    z

      .number()

      .int("Le montant doit être un nombre entier de FCFA.")

      .positive("Le montant doit être supérieur à zéro.")

      .safe("Le montant est trop élevé."),
  )

const validCalendarDate = z

  .string()

  .regex(/^\d{4}-\d{2}-\d{2}$/, "Saisissez une date valide.")

  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`)

    return (
      !Number.isNaN(parsed.valueOf()) &&
      parsed.toISOString().slice(0, 10) === value
    )
  }, "Saisissez une date valide.")

const emailAddress = z

  .string()

  .trim()

  .email("Saisissez une adresse e-mail valide.")

  .max(254, "L’adresse e-mail est trop longue.")

  .transform((value) => value.toLocaleLowerCase("fr-FR"))

const phoneNumber = z

  .string()

  .trim()

  .regex(/^\+?[0-9\s().-]{8,24}$/, "Saisissez un numéro de téléphone valide.")

  .refine((value) => {
    const digitCount = value.replace(/\D/g, "").length

    return digitCount >= 8 && digitCount <= 15
  }, "Le numéro doit contenir entre 8 et 15 chiffres.")

export const studentInputSchema = z.object({
  firstName: requiredText("Le prénom"),

  lastName: requiredText("Le nom"),

  className: requiredText("La classe"),

  level: z.enum(["Maternelle", "Primaire", "Secondaire"], {
    error: "Sélectionnez un niveau valide.",
  }),

  parent: requiredText("Le parent"),

  total: positiveXofAmount,
})

export const parentInputSchema = z.object({
  firstName: requiredText("Le prénom"),

  lastName: requiredText("Le nom"),

  phone: phoneNumber,

  email: emailAddress,
})

export const classInputSchema = z.object({
  name: requiredText("Le nom de la classe", 80),

  level: z.enum(["Maternelle", "Primaire", "Secondaire"], {
    error: "Sélectionnez un niveau valide.",
  }),
})

export const paymentPlanInputSchema = z.object({
  name: requiredText("Le nom du plan", 100),

  amount: positiveXofAmount,

  installments: z

    .string()

    .trim()

    .regex(/^\d+$/, "Saisissez un nombre de tranches entier.")

    .transform(Number)

    .pipe(
      z

        .number()

        .int()

        .min(1, "Un plan doit comporter au moins une tranche.")

        .max(12, "Un plan ne peut pas dépasser 12 tranches."),
    ),
})

export function createManualPaymentSchema(maximumAmount: number) {
  return z

    .object({
      studentId: requiredText("L’apprenant"),

      amount: positiveXofAmount,

      date: validCalendarDate,

      method: z.enum(["Espèces", "Mobile Money", "Virement"], {
        error: "Sélectionnez un mode de paiement valide.",
      }),

      reference: z

        .string()

        .trim()

        .min(3, "La référence doit contenir au moins 3 caractères.")

        .max(64, "La référence ne peut pas dépasser 64 caractères.")

        .regex(
          /^[A-Za-z0-9][A-Za-z0-9._/-]*$/,

          "La référence contient des caractères non autorisés.",
        ),

      comment: z

        .string()

        .trim()

        .max(500, "Le commentaire ne peut pas dépasser 500 caractères."),
    })

    .superRefine((payment, context) => {
      if (
        !Number.isSafeInteger(maximumAmount) ||
        maximumAmount < 0 ||
        payment.amount > maximumAmount
      ) {
        context.addIssue({
          code: "custom",

          path: ["amount"],

          message:
            maximumAmount > 0
              ? "Le montant dépasse le solde restant."
              : "Aucun solde ne reste à régler pour cet apprenant.",
        })
      }
    })
}

export type StudentInput = z.infer<typeof studentInputSchema>

export type ParentInput = z.infer<typeof parentInputSchema>

export type ClassInput = z.infer<typeof classInputSchema>

export type PaymentPlanInput = z.infer<typeof paymentPlanInputSchema>

export type ManualPaymentInput = z.infer<ReturnType<typeof createManualPaymentSchema>>
