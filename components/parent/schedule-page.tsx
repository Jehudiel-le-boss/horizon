"use client"

import { Badge, Amount, Icon, PageIntro } from "@/components/shared/ui"

import { usePortalActions } from "@/components/portal/portal-context"

const dueDates = [
  "15 juillet 2026",

  "15 septembre 2026",

  "15 octobre 2026",

  "15 novembre 2026",

  "15 janvier 2027",
]

const formatAmount = (value: number) =>
  `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`

export default function Schedule() {
  const { navigate, students, payments, selectedStudentId, selectStudent } =
    usePortalActions()

  const familyStudents = students.filter(
    (student) => student.parent === "Aminata Koffi",
  )

  const student =
    familyStudents.find((item) => item.id === selectedStudentId) ??
    familyStudents[0]

  if (!student) {
    return (
      <PageIntro
        title="Échéancier"
        text="Aucun apprenant n’est actuellement associé à votre espace."
      />
    )
  }

  const total = Number(student.total.replace(/\D/g, ""))

  const paid = Number(student.paid.replace(/\D/g, ""))

  const remaining = Number(student.remaining.replace(/\D/g, ""))

  const installmentAmount = Math.ceil(total / 5 / 1000) * 1000

  const paidInstallments = Math.min(
    5,

    Math.floor(paid / Math.max(installmentAmount, 1)),
  )

  const familyPayments = payments.filter(
    (payment) => payment.student === `${student.firstName} ${student.lastName}`,
  )

  const installments = dueDates.map((date, index) => {
    const value =
      index === 4 ? total - installmentAmount * 4 : installmentAmount

    const status =
      index < paidInstallments
        ? "Payée"
        : index === paidInstallments && remaining > 0
          ? "Échéance proche"
          : "À venir"

    return {
      number: index + 1,

      amount: Math.max(value, 0),

      dueDate: date,

      status,

      paidDate:
        index < paidInstallments ? (familyPayments[index]?.date ?? "—") : "—",
    }
  })

  const progress = Math.round((paidInstallments / 5) * 100)

  return (
    <>
      <PageIntro
        title="Échéancier"
        text={`Suivez chaque tranche du plan de paiement de ${student.firstName} ${student.lastName}.`}
        actions={
          <select
            aria-label="Choisir un enfant"
            value={student.id}
            onChange={(event) => selectStudent(event.target.value)}
          >
            {familyStudents.map((item) => (
              <option value={item.id} key={item.id}>
                {item.firstName} {item.lastName} — {item.className}
              </option>
            ))}
          </select>
        }
      />
      <div className="schedule-summary">
        <div>
          <small>Plan annuel</small>
          <b>5 tranches</b>
        </div>
        <div className="progress xl">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div>
          <b>{paidInstallments} / 5</b>
          <small>tranches payées</small>
        </div>
      </div>
      <section className="timeline">
        {installments.map((installment, index) => (
          <article
            className={`timeline-item ${
              index < paidInstallments
                ? "complete"
                : installment.status === "Échéance proche"
                  ? "current"
                  : ""
            }`}
            key={installment.number}
          >
            <div className="timeline-marker">
              {index < paidInstallments ? (
                <Icon name="check" size={17} />
              ) : (
                installment.number
              )}
            </div>
            <div className="timeline-card">
              <div>
                <span>Tranche {installment.number}</span>
                <Amount>{formatAmount(installment.amount)}</Amount>
              </div>
              <div>
                <small>Date limite</small>
                <b>{installment.dueDate}</b>
              </div>
              <div>
                <small>Date de paiement</small>
                <b>{installment.paidDate}</b>
              </div>
              <Badge
                tone={
                  installment.status === "Payée"
                    ? "success"
                    : installment.status === "Échéance proche"
                      ? "warning"
                      : "neutral"
                }
              >
                {installment.status}
              </Badge>
              <button
                aria-label={`Voir les paiements liés à la tranche ${installment.number}`}
                onClick={() => navigate("payments")}
              >
                <Icon name="more" />
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
