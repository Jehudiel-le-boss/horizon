"use client"

import { Amount, Button, Icon, PageIntro } from "@/components/shared/ui"
import { usePortalActions } from "@/components/portal/portal-context"

function formatDueDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`)
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export default function AdminSchedules() {
  const { classes, students, paymentPlans, setModal, addPaymentInstallment } =
    usePortalActions()
  return (
    <>
      <PageIntro
        title="Échéanciers"
        text="Créez et gérez les plans de paiement proposés aux familles."
        actions={
          <Button icon="plus" onClick={() => setModal("plan")}>
            Créer un plan
          </Button>
        }
      />
      <div className="plan-grid">
        {paymentPlans.map((plan) => {
          const matchingStudents = students.filter((student) =>
            plan.classNames.includes(student.className),
          ).length

          return (
            <section
              className={`card plan-card ${
                plan.name === "Plan standard" ? "featured" : ""
              }`}
              key={plan.name}
            >
              {plan.name === "Plan standard" && (
                <span className="popular">Le plus utilisé</span>
              )}
              <div className="card-heading">
                <div>
                  <span>Plan de paiement</span>
                  <h3>{plan.name}</h3>
                </div>
                <button
                  className="icon-btn"
                  aria-label={`Modifier ${plan.name}`}
                  onClick={() => setModal(`plan-edit:${plan.name}`)}
                >
                  <Icon name="more" />
                </button>
              </div>
              <Amount>{plan.installments}</Amount>
              <p>
                {matchingStudents} dossier
                {matchingStudents === 1 ? "" : "s"} mocké
                {matchingStudents === 1 ? "" : "s"}
              </p>
              <p className="plan-amount-note">
                Les montants sont calculés selon les frais de chaque apprenant.
              </p>
              <div className="plan-class-list" aria-label="Classes concernées">
                <b>Classes concernées</b>
                {plan.classNames.length > 0 ? (
                  <div>
                    {plan.classNames.map((className) => {
                      const classRecord = classes.find(
                        (item) => item.name === className,
                      )
                      return (
                        <span key={className}>
                          {className}
                          {classRecord ? ` · ${classRecord.level}` : ""}
                        </span>
                      )
                    })}
                  </div>
                ) : (
                  <span className="plan-class-warning">
                    Aucune classe liée — modifiez ce plan pour l’affecter.
                  </span>
                )}
              </div>
              <div className="plan-tranches">
                {plan.dueDates.map((dueDate, index) => (
                  <span key={dueDate}>
                    <i>{index + 1}</i>
                    <b>Date limite</b>
                    <small>{formatDueDate(dueDate)}</small>
                  </span>
                ))}
              </div>
              <div className="plan-actions">
                <Button
                  variant="secondary"
                  onClick={() => setModal(`plan-edit:${plan.name}`)}
                >
                  Modifier
                </Button>
                <Button
                  variant="ghost"
                  icon="plus"
                  disabled={Number.parseInt(plan.installments, 10) >= 12}
                  onClick={() => addPaymentInstallment(plan.name)}
                >
                  Ajouter une tranche
                </Button>
                <button
                  className="delete-link"
                  onClick={() => setModal(`delete:${plan.name}`)}
                >
                  Supprimer
                </button>
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}
