"use client"

import { useState } from "react"
import {
  Button,
  PageIntro,
  PaymentTable,
  StatCard,
  TableToolbar,
} from "@/components/shared/ui"
import { usePortalActions } from "@/components/portal/portal-context"

export default function AdminPayments() {
  const { setModal, payments } = usePortalActions()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const filteredPayments = payments.filter(
    (payment) =>
      `${payment.reference} ${payment.student} ${payment.method}`
        .toLocaleLowerCase("fr")
        .includes(search.toLocaleLowerCase("fr")) &&
      (!statusFilter || payment.status === statusFilter),
  )
  return (
    <>
      <PageIntro
        title="Paiements"
        text="Enregistrez et vérifiez l’ensemble des règlements."
        actions={
          <Button icon="plus" onClick={() => setModal("payment")}>
            Enregistrer un paiement
          </Button>
        }
      />
      <div className="stats-grid three">
        <StatCard
          icon="money"
          label="Encaissé aujourd’hui"
          value="2 450 000 FCFA"
          note="18 paiements"
          tone="green"
        />
        <StatCard
          icon="clock"
          label="À vérifier"
          value="23 paiements"
          note="4,8 M FCFA"
          tone="orange"
        />
        <StatCard
          icon="chart"
          label="Ce mois-ci"
          value="12 400 000 FCFA"
          note="+8,2% vs septembre"
        />
      </div>
      <TableToolbar
        placeholder="Référence, apprenant, parent..."
        onSearch={setSearch}
        statuses={["Payé", "En attente", "Refusé"]}
        onStatusChange={setStatusFilter}
      />
      <section className="card data-card">
        <PaymentTable
          rows={filteredPayments}
          onReceipt={(payment) => setModal(`receipt:${payment.reference}`)}
        />
      </section>
    </>
  )
}
