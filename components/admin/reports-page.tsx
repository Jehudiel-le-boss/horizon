"use client"

import { Button, PageIntro, StatCard } from "@/components/shared/ui"

import { usePortalActions } from "@/components/portal/portal-context"

import { formatXofAmount } from "@/lib/domain/money"

import {
  summarizePaymentsByMethod,
  summarizePaymentsByMonth,
  summarizeStudents,
} from "@/lib/domain/financial-summary"
import { exportCsv } from "@/lib/export-csv"
import { FinanceChart } from "@/components/shared/finance-chart"

function formatPercent(value: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(
    value,
  )
}

export default function Reports() {
  const { payments, students } = usePortalActions()

  const finances = summarizeStudents(students)

  const methods = summarizePaymentsByMethod(payments)
  const monthlyPayments = summarizePaymentsByMonth(payments)

  function exportReport() {
    exportCsv("rapport-financier-horizon.csv", [
      ["Indicateur", "Valeur"],

      ["Apprenants", String(finances.studentCount)],

      ["Total attendu", `${formatXofAmount(finances.expected)} XOF`],

      ["Total encaissé", `${formatXofAmount(finances.collected)} XOF`],

      ["Total restant", `${formatXofAmount(finances.outstanding)} XOF`],

      ["Taux de recouvrement", `${formatPercent(finances.collectionRate)} %`],

      [],

      [
        "Niveau",

        "Attendu (XOF)",

        "Encaissé (XOF)",

        "Restant (XOF)",

        "Taux (%)",
      ],

      ...finances.levels.map((level) => [
        level.level,

        String(level.expected),

        String(level.collected),

        String(level.outstanding),

        formatPercent(level.collectionRate),
      ]),
    ])
  }

  return (
    <>
      <PageIntro
        title="Rapports financiers"
        text="Synthèse calculée à partir des dossiers apprenants de démonstration."
        actions={
          <Button variant="secondary" icon="download" onClick={exportReport}>
            Exporter en CSV
          </Button>
        }
      />
      <div className="report-filter">
        <select aria-label="Année scolaire">
          <option>Année scolaire 2026 - 2027</option>
        </select>
        <span>
          Calculé depuis {finances.studentCount} dossier
          {finances.studentCount === 1 ? "" : "s"} mocké
          {finances.studentCount === 1 ? "" : "s"}
        </span>
      </div>
      <div className="stats-grid three">
        <StatCard
          icon="money"
          label="Total attendu"
          value={`${formatXofAmount(finances.expected)} FCFA`}
        />
        <StatCard
          icon="check"
          label="Total encaissé"
          value={`${formatXofAmount(finances.collected)} FCFA`}
          tone="green"
        />
        <StatCard
          icon="wallet"
          label="Total restant"
          value={`${formatXofAmount(finances.outstanding)} FCFA`}
          tone="orange"
        />
      </div>
      <div className="admin-main-grid reports">
        <section className="card collection">
          <div className="card-heading">
            <div>
              <span>Historique de démonstration</span>
              <h3>Encaissements mensuels</h3>
            </div>
          </div>
          <p>
            Montants tirés de l’échantillon de paiements mockés ; l’historique
            réel sera disponible après branchement de la base.
          </p>
          <FinanceChart data={monthlyPayments} height={250} />
          <div className="card-heading">
            <div>
              <span>Répartition</span>
              <h3>Par mode de paiement</h3>
            </div>
          </div>
          {methods.length ? (
            methods.map((summary) => (
              <div className="collection-row" key={summary.method}>
                <div>
                  <b>{summary.method}</b>
                  <span>
                    {formatXofAmount(summary.amount)} FCFA ·{" "}
                    {summary.paymentCount} paiement
                    {summary.paymentCount === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="progress">
                  <span style={{ width: `${summary.share}%` }} />
                </div>
                <strong>{formatPercent(summary.share)}%</strong>
              </div>
            ))
          ) : (
            <p>Aucun paiement dans l’historique de démonstration.</p>
          )}
        </section>
        <section className="card report-ring">
          <div className="card-heading">
            <div>
              <span>Vue globale</span>
              <h3>Taux de recouvrement</h3>
            </div>
          </div>
          <div
            className="ring huge"
            role="progressbar"
            aria-label="Taux de recouvrement"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={finances.collectionRate}
          >
            {formatPercent(finances.collectionRate)}%<small>encaissé</small>
          </div>
          <div className="report-legend">
            <span>
              <i className="green-dot" /> Encaissé{" "}
              <b>{formatXofAmount(finances.collected)} FCFA</b>
            </span>
            <span>
              <i className="orange-dot" /> Restant{" "}
              <b>{formatXofAmount(finances.outstanding)} FCFA</b>
            </span>
          </div>
        </section>
      </div>
      <section className="card">
        <div className="card-heading">
          <div>
            <span>Comparatif</span>
            <h3>Recouvrement par niveau</h3>
          </div>
        </div>
        <div className="report-levels">
          {finances.levels.map((level) => (
            <div key={level.level}>
              <span>
                <b>{level.level}</b>
                <small>
                  {formatXofAmount(level.collected)} encaissés sur{" "}
                  {formatXofAmount(level.expected)} FCFA
                </small>
              </span>
              <div className="progress">
                <i style={{ width: `${level.collectionRate}%` }} />
              </div>
              <strong>{formatPercent(level.collectionRate)}%</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
