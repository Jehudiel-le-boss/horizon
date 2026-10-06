"use client"

import { Amount, Button, Icon, PageIntro } from "@/components/shared/ui"
import { usePortalActions } from "@/components/portal/portal-context"

export default function AdminSchedules() {
  const { paymentPlans, setModal, addPaymentInstallment } = usePortalActions()
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
        {paymentPlans.map((plan) => (
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
            <Amount>{plan.amount}</Amount>
            <p>
              {plan.installments} • {plan.students}
            </p>
            <div className="plan-tranches">
              {Array.from({
                length: Math.min(
                  Number.parseInt(plan.installments, 10) || 1,
                  5,
                ),
              })
                .slice(0, 5)
                .map((_, j) => (
                  <span key={j}>
                    <i>{j + 1}</i>
                    <b>
                      {new Intl.NumberFormat("fr-FR").format(
                        Math.floor(
                          Number(plan.amount.replace(/\D/g, "")) /
                            Math.max(Number.parseInt(plan.installments, 10), 1),
                        ),
                      )}{" "}
                      FCFA
                    </b>
                    <small>
                      15 {["sept.", "oct.", "nov.", "déc.", "jan."][j % 5]}
                    </small>
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
        ))}
      </div>
    </>
  )
}
