"use client"

import {
  Amount,
  Badge,
  BarChart,
  Button,
  Icon,
  PageIntro,
  PaymentTable,
  StatCard,
  type IconName,
} from "@/components/shared/ui"
import { usePortalActions } from "@/components/portal/portal-context"
import { exportCsv } from "@/lib/export-csv"

export default function AdminDashboard() {
  const { navigate, payments } = usePortalActions()
  return (
    <>
      <PageIntro
        eyebrow="Mardi 6 octobre 2026"
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
          value="850"
          note="+24 cette année"
        />
        <StatCard
          icon="money"
          label="Total attendu"
          value="425 M FCFA"
          note="Année 2026 - 2027"
          tone="purple"
        />
        <StatCard
          icon="check"
          label="Total encaissé"
          value="320 M FCFA"
          note="+12,4 M ce mois"
          tone="green"
        />
        <StatCard
          icon="wallet"
          label="Reste à recouvrer"
          value="105 M FCFA"
          note="24,7% du total"
          tone="orange"
        />
        <article className="rate-card">
          <div>
            <small>Taux de recouvrement</small>
            <Amount>75,3%</Amount>
            <p>
              <b>+ 4,2%</b> par rapport au mois dernier
            </p>
          </div>
          <div className="ring large-ring">75%</div>
        </article>
      </div>
      <div className="admin-main-grid">
        <section className="card chart-card">
          <div className="card-heading">
            <div>
              <span>Aperçu financier</span>
              <h3>Évolution du recouvrement</h3>
            </div>
            <select>
              <option>6 derniers mois</option>
            </select>
          </div>
          <div className="legend">
            <span>
              <i className="blue-dot" /> Attendu
            </span>
            <span>
              <i className="green-dot" /> Encaissé
            </span>
          </div>
          <BarChart />
        </section>
        <section className="card alerts">
          <div className="card-heading">
            <div>
              <span>À traiter</span>
              <h3>Situations nécessitant votre attention</h3>
            </div>
            <span className="count red">94</span>
          </div>
          {[
            [
              "danger",
              "clock",
              "48 apprenants",
              "ont une échéance en retard",
              "students",
            ],
            [
              "warning",
              "receipt",
              "23 paiements",
              "doivent être vérifiés",
              "payments",
            ],
            [
              "info",
              "calendar",
              "15 échéances",
              "arrivent cette semaine",
              "schedule",
            ],
            [
              "neutral",
              "wallet",
              "8 comptes",
              "présentent un solde important",
              "students",
            ],
          ].map(([tone, icon, title, text, target]) => (
            <div className="alert-row" key={title}>
              <span className={`mini-icon ${tone}`}>
                <Icon name={icon as IconName} />
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
        </section>
      </div>
      <div className="dashboard-grid lower">
        <section className="card table-card">
          <div className="card-heading">
            <div>
              <span>Activité en temps réel</span>
              <h3>Derniers paiements reçus</h3>
            </div>
            <button onClick={() => navigate("payments")}>
              Voir tout <Icon name="arrow" size={16} />
            </button>
          </div>
          <PaymentTable compact />
        </section>
        <section className="card collection">
          <div className="card-heading">
            <div>
              <span>Performance</span>
              <h3>Recouvrement par niveau</h3>
            </div>
          </div>
          {[
            ["Maternelle", "82", "41,2 M"],
            ["Primaire", "76", "138,4 M"],
            ["Secondaire", "69", "140,4 M"],
          ].map(([label, val, amount]) => (
            <div className="collection-row" key={label}>
              <div>
                <b>{label}</b>
                <span>{amount} FCFA</span>
              </div>
              <div className="progress">
                <span style={{ width: `${val}%` }} />
              </div>
              <strong>{val}%</strong>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}
