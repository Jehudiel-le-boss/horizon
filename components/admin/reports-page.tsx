"use client"

import { useState } from "react"
import {
  Amount,
  Badge,
  BarChart,
  Button,
  Icon,
  Logo,
  PageIntro,
  PaymentTable,
  StatCard,
  TableToolbar,
  payments,
  type IconName,
} from "@/components/shared/ui"

export default function Reports() {
  return (
    <>
      <PageIntro
        title="Rapports financiers"
        text="Analysez les performances de recouvrement de l’établissement."
        actions={
          <>
            <Button variant="secondary" icon="file">
              Export PDF
            </Button>
            <Button variant="secondary" icon="download">
              Export Excel
            </Button>
          </>
        }
      />
      <div className="report-filter">
        <select>
          <option>Année scolaire 2026 - 2027</option>
        </select>
        <select>
          <option>Tous les niveaux</option>
        </select>
        <select>
          <option>Toutes les classes</option>
        </select>
        <span>Dernière mise à jour : aujourd’hui à 09:42</span>
      </div>
      <div className="stats-grid three">
        <StatCard icon="money" label="Total attendu" value="425 M FCFA" />
        <StatCard
          icon="check"
          label="Total encaissé"
          value="320 M FCFA"
          tone="green"
        />
        <StatCard
          icon="wallet"
          label="Total restant"
          value="105 M FCFA"
          tone="orange"
        />
      </div>
      <div className="admin-main-grid reports">
        <section className="card chart-card">
          <div className="card-heading">
            <div>
              <span>Flux de trésorerie</span>
              <h3>Paiements par période</h3>
            </div>
            <select>
              <option>Mensuel</option>
            </select>
          </div>
          <BarChart />
        </section>
        <section className="card report-ring">
          <div className="card-heading">
            <div>
              <span>Vue globale</span>
              <h3>Taux de recouvrement</h3>
            </div>
          </div>
          <div className="ring huge">
            75,3%<small>encaissé</small>
          </div>
          <div className="report-legend">
            <span>
              <i className="green-dot" /> Encaissé <b>320 M</b>
            </span>
            <span>
              <i className="orange-dot" /> Restant <b>105 M</b>
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
          {[
            ["Maternelle", "50 M", "41,2 M", "82,4"],
            ["Primaire", "182 M", "138,4 M", "76,0"],
            ["Secondaire", "193 M", "140,4 M", "72,7"],
          ].map((r) => (
            <div key={r[0]}>
              <span>
                <b>{r[0]}</b>
                <small>
                  {r[2]} encaissés sur {r[1]}
                </small>
              </span>
              <div className="progress">
                <i style={{ width: `${r[3]}%` }} />
              </div>
              <strong>{r[3]}%</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
