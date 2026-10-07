"use client"

import {
  Amount,
  Button,
  Icon,
  PageIntro,
  PaymentTable,
  StatCard,
} from "@/components/shared/ui"
import { usePortalActions } from "@/components/portal/portal-context"
import { exportCsv } from "@/lib/export-csv"
import { formatXofAmount } from "@/lib/domain/money"
import {
  summarizePaymentsByMonth,
  summarizeStudents,
} from "@/lib/domain/financial-summary"
import { FinanceChart } from "@/components/shared/finance-chart"

function formatPercent(value: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(
    value,
  )
}

export default function AdminDashboard() {
  const { navigate, payments, students } = usePortalActions()
  const finances = summarizeStudents(students)
  const monthlyPayments = summarizePaymentsByMonth(payments)
  const alerts: {
    tone: "danger" | "info"
    icon: "wallet" | "receipt"
    title: string
    text: string
    target: string
  }[] = []

  if (finances.studentsWithBalance > 0) {
    alerts.push({
      tone: "danger",
      icon: "wallet",
      title: `${finances.studentsWithBalance} apprenant${
        finances.studentsWithBalance === 1 ? "" : "s"
      }`,
      text: "présentent un solde restant",
      target: "students",
    })
  }

  if (payments.length > 0) {
    alerts.push({
      tone: "info",
      icon: "receipt",
      title: `${payments.length} paiement${payments.length === 1 ? "" : "s"}`,
      text: "figure dans l’historique de démonstration",
      target: "payments",
    })
  }

  return (
    <>
      <PageIntro
        eyebrow="Données de démonstration"
        title="Bonjour, Yao"
        text="Voici l’état du recouvrement de votre établissement."
        actions={
          <>
            <Button
              variant="secondary"
              icon="download"
              onClick={() =>
                exportCsv("rapport-paiements-horizon.csv", [
                  [
                    "Référence",
                    "Apprenant",
                    "Date",
                    "Mode",
                    "Montant",
                    "Statut",
                  ],
                  ...payments.map((payment) => [
                    payment.reference,
                    payment.student,
                    payment.date,
                    payment.method,
                    payment.amount,
                    payment.status,
                  ]),
                ])
              }
            >
              Exporter le rapport
            </Button>
            <Button icon="plus" onClick={() => navigate("payments")}>
              Enregistrer un paiement
            </Button>
          </>
        }
      />
      <div className="admin-stats">
        <StatCard
          icon="people"
          label="Nombre d’apprenants"
          value={String(finances.studentCount)}
          note="Dossiers de démonstration"
        />
        <StatCard
          icon="money"
          label="Total attendu"
          value={`${formatXofAmount(finances.expected)} FCFA`}
          note="Année 2026 - 2027"
          tone="purple"
        />
        <StatCard
          icon="check"
          label="Total encaissé"
          value={`${formatXofAmount(finances.collected)} FCFA`}
          note="Calculé depuis les dossiers apprenants"
          tone="green"
        />
        <StatCard
          icon="wallet"
          label="Reste à recouvrer"
          value={`${formatXofAmount(finances.outstanding)} FCFA`}
          note={`${formatPercent(finances.expected === 0 ? 0 : (finances.outstanding / finances.expected) * 100)}% du total`}
          tone="orange"
        />
        <article className="rate-card">
          <div>
            <small>Taux de recouvrement</small>
            <Amount>{formatPercent(finances.collectionRate)}%</Amount>
            <p>Calculé sur les soldes des apprenants</p>
          </div>
          <div className="ring large-ring">
            {formatPercent(finances.collectionRate)}%
          </div>
        </article>
      </div>
      <div className="admin-main-grid">
        <section className="card chart-card">
          <div className="card-heading">
            <div>
              <span>Historique des règlements</span>
              <h3>Encaissements par mois</h3>
            </div>
          </div>
          <p>
            Montants des paiements confirmés présents dans les données mockées.
          </p>
          <FinanceChart data={monthlyPayments} height={250} />
        </section>
        <section className="card alerts">
          <div className="card-heading">
            <div>
              <span>Vue d’ensemble</span>
              <h3>Soldes et historique</h3>
            </div>
          </div>
          {alerts.map(({ tone, icon, title, text, target }) => (
            <div className="alert-row" key={title}>
              <span className={`mini-icon ${tone}`}>
                <Icon name={icon} />
              </span>
              <div>
                <b>{title}</b>
                <small>{text}</small>
              </div>
              <button onClick={() => navigate(target)}>
                Voir <Icon name="chevron" size={15} />
              </button>
            </div>
          ))}
          {alerts.length === 0 && (
            <p>Aucune situation à signaler dans les données disponibles.</p>
          )}
        </section>
      </div>
      <div className="dashboard-grid lower">
        <section className="card table-card">
          <div className="card-heading">
            <div>
              <span>Historique mocké</span>
              <h3>Paiements enregistrés</h3>
            </div>
            <button onClick={() => navigate("payments")}>
              Voir tout <Icon name="arrow" size={16} />
            </button>
          </div>
          <PaymentTable compact rows={payments} />
        </section>
        <section className="card collection">
          <div className="card-heading">
            <div>
              <span>Performance</span>
              <h3>Recouvrement par niveau</h3>
            </div>
          </div>
          {finances.levels.map((level) => (
            <div className="collection-row" key={level.level}>
              <div>
                <b>{level.level}</b>
                <span>{formatXofAmount(level.collected)} FCFA</span>
              </div>
              <div className="progress">
                <span style={{ width: `${level.collectionRate}%` }} />
              </div>
              <strong>{formatPercent(level.collectionRate)}%</strong>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}
