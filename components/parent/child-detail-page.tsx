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
import { usePortalActions } from "@/components/portal/portal-context"

export default function ChildDetail() {
  const { navigate, setModal } = usePortalActions()
  return (
    <>
      <button className="back-row" onClick={() => navigate("children")}>
        <Icon name="arrow" size={17} /> Retour à mes enfants
      </button>
      <section className="student-hero">
        <div className="large-avatar">DK</div>
        <div>
          <span>Primaire</span>
          <h2>David Koffi</h2>
          <p>CM2 — Groupe A • Année scolaire 2026 - 2027</p>
        </div>
        <Badge>Situation à jour</Badge>
      </section>
      <div className="tabs">
        <button className="active">Vue d’ensemble</button>
        <button onClick={() => navigate("schedule")}>Échéancier</button>
        <button onClick={() => navigate("payments")}>Paiements</button>
      </div>
      <div className="stats-grid three">
        <StatCard icon="school" label="Montant total" value="450 000 FCFA" />
        <StatCard
          icon="check"
          label="Montant payé"
          value="300 000 FCFA"
          tone="green"
        />
        <StatCard
          icon="wallet"
          label="Reste à payer"
          value="150 000 FCFA"
          tone="orange"
        />
      </div>
      <div className="dashboard-grid">
        <section className="card progress-card">
          <div className="card-heading">
            <div>
              <span>Résumé financier</span>
              <h3>Progression annuelle</h3>
            </div>
            <b className="big-percent">66,7%</b>
          </div>
          <div className="progress xl">
            <span className="w-67" />
          </div>
          <div className="fee-lines">
            <span>
              <i />
              Frais d’inscription <b>50 000 FCFA</b>
              <Badge>Soldé</Badge>
            </span>
            <span>
              <i />
              Frais de scolarité <b>250 000 / 400 000 FCFA</b>
              <Badge tone="warning">En cours</Badge>
            </span>
          </div>
        </section>
        <section className="card due-card">
          <div className="card-heading">
            <div>
              <span>À venir</span>
              <h3>Prochaine échéance</h3>
            </div>
            <span className="date-tile">
              <b>15</b>
              <small>OCT</small>
            </span>
          </div>
          <Amount>50 000 FCFA</Amount>
          <p>Tranche n°3 • dans 9 jours</p>
          <Button onClick={() => navigate("schedule")}>
            Voir toutes les tranches
          </Button>
        </section>
      </div>
    </>
  )
}
