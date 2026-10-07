"use client"

import { Badge, Amount, Icon, PageIntro } from "@/components/shared/ui"

import { usePortalActions } from "@/components/portal/portal-context"

import { splitAmountIntoInstallments } from "@/lib/domain/money"

const formatAmount = (value: number) =>
  `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`

const formatDueDate = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`))

export default function Schedule() {
  const {
    navigate,
    students,
    payments,
    paymentPlans,
    selectedStudentId,
    selectStudent,
  } = usePortalActions()

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

  const plan = paymentPlans.find((item) =>
    item.classNames.includes(student.className),
  )

  if (!plan) {
    return (
      <>
        <PageIntro
          title="Échéancier"
          text={`Aucun échéancier n’a été affecté à la classe ${student.className}.`}
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
        <section className="card schedule-unassigned">
          <Icon name="info" />
          <div>
            <h3>Le plan de paiement n’est pas encore configuré</h3>
            <p>
              L’administration doit affecter un échéancier à cette classe avant
              que les échéances puissent s’afficher.
            </p>
          </div>
        </section>
      </>
    )
  }

  const total = Number(student.total.replace(/\D/g, ""))

  const paid = Number(student.paid.replace(/\D/g, ""))

  const remaining = Number(student.remaining.replace(/\D/g, ""))

  const installmentCount = plan.dueDates.length
  const installmentAmounts = splitAmountIntoInstallments(
    total,
    installmentCount,
  )
  let unpaidAmount = paid
  let paidInstallments = 0

  for (const amount of installmentAmounts) {
    if (unpaidAmount < amount) break

    unpaidAmount -= amount
    paidInstallments += 1
  }

  const familyPayments = payments.filter(
    (payment) => payment.student === `${student.firstName} ${student.lastName}`,
  )

  const installments = plan.dueDates.map((date, index) => {
    const status =
      index < paidInstallments
        ? "Payée"
        : index === paidInstallments && remaining > 0
          ? "Échéance proche"
          : "À venir"

    return {
      number: index + 1,

      amount: installmentAmounts[index],

      dueDate: formatDueDate(date),

      status,

      paidDate:
        index < paidInstallments ? (familyPayments[index]?.date ?? "—") : "—",
    }
  })

  const progress = Math.round((paidInstallments / installmentCount) * 100)

  return (
    <>
      <PageIntro
        title="Échéancier"
        text={`Suivez le plan « ${plan.name} » de ${student.firstName} ${student.lastName} (${student.className}).`}
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
          <small>Calendrier de paiement</small>
          <b>{plan.installments}</b>
        </div>
        <div className="progress xl">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div>
          <b>
            {paidInstallments} / {installmentCount}
          </b>
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
