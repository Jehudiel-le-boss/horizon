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
import { formatXofAmount, parseXofDisplayAmount } from "@/lib/domain/money"

export default function AdminPayments() {
  const { setModal, payments, students } = usePortalActions()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const confirmedPayments = payments.filter(
    (payment) => payment.status === "Payé",
  )
  const pendingPayments = payments.filter(
    (payment) => payment.status === "En attente",
  )
  const collectedAmount = confirmedPayments.reduce(
    (total, payment) => total + parseXofDisplayAmount(payment.amount),
    0,
  )
  const pendingAmount = pendingPayments.reduce(
    (total, payment) => total + parseXofDisplayAmount(payment.amount),
    0,
  )
  const normalizedSearch = search.toLocaleLowerCase("fr")
  const filteredPayments = payments.filter((payment) => {
    const student = students.find(
      (record) => `${record.firstName} ${record.lastName}` === payment.student,
    )
    const searchableText = `${payment.reference} ${payment.student} ${student?.parent ?? ""} ${payment.method}`
    return (
      searchableText.toLocaleLowerCase("fr").includes(normalizedSearch) &&
      (!statusFilter || payment.status === statusFilter)
    )
  })
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
          label="Total encaissé"
          value={`${formatXofAmount(collectedAmount)} FCFA`}
          note={`${confirmedPayments.length} paiement${
            confirmedPayments.length === 1 ? "" : "s"
          } confirmé${confirmedPayments.length === 1 ? "" : "s"} mocké${
            confirmedPayments.length === 1 ? "" : "s"
          }`}
          tone="green"
        />
        <StatCard
          icon="clock"
          label="À vérifier"
          value={`${pendingPayments.length} paiement${
            pendingPayments.length === 1 ? "" : "s"
          }`}
          note={`${formatXofAmount(pendingAmount)} FCFA en attente`}
          tone="orange"
        />
        <StatCard
          icon="chart"
          label="Transactions mockées"
          value={String(payments.length)}
          note="Historique de démonstration"
        />
      </div>
      <TableToolbar
        placeholder="Référence, apprenant, parent..."
        onSearch={setSearch}
        statuses={["Payé", "En attente", "Échoué"]}
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
