"use client"

import { useState } from "react"

import {
  Amount,
  Button,
  Icon,
  PageIntro,
  PaymentTable,
} from "@/components/shared/ui"

import { usePortalActions } from "@/components/portal/portal-context"
import { CustomScrollbar } from "@/components/shared/custom-scrollbar"

import { exportCsv } from "@/lib/export-csv"

export default function Payments() {
  const { payments, students, setModal } = usePortalActions()

  const [search, setSearch] = useState("")

  const [studentFilter, setStudentFilter] = useState("all")

  const [methodFilter, setMethodFilter] = useState("all")

  const familyStudents = students.filter(
    (student) => student.parent === "Aminata Koffi",
  )

  const familyNames = new Set(
    familyStudents.map((student) => `${student.firstName} ${student.lastName}`),
  )

  const familyPayments = payments.filter((payment) =>
    familyNames.has(payment.student),
  )

  const filteredPayments = familyPayments.filter(
    (payment) =>
      `${payment.reference} ${payment.student} ${payment.method}`

        .toLocaleLowerCase("fr")

        .includes(search.toLocaleLowerCase("fr")) &&
      (studentFilter === "all" || payment.student === studentFilter) &&
      (methodFilter === "all" || payment.method === methodFilter),
  )

  const totalAmount = filteredPayments.reduce(
    (total, payment) => total + Number(payment.amount.replace(/[^\d]/g, "")),

    0,
  )

  const formattedTotal = new Intl.NumberFormat("fr-FR").format(totalAmount)

  const exportRows = [
    ["Référence", "Apprenant", "Date", "Mode", "Montant", "Statut"],

    ...filteredPayments.map((payment) => [
      payment.reference,

      payment.student,

      payment.date,

      payment.method,

      payment.amount,

      payment.status,
    ]),
  ]

  return (
    <>
      <PageIntro
        title="Paiements"
        text="Retrouvez l’historique complet des transactions de votre famille."
        actions={
          <Button
            variant="secondary"
            icon="download"
            onClick={() =>
              exportCsv("paiements-famille-horizon.csv", exportRows)
            }
          >
            Exporter
          </Button>
        }
      />
      <CustomScrollbar className="filters">
        <div>
          <Icon name="search" size={18} />
          <input
            placeholder="Rechercher une référence..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <select
          aria-label="Filtrer par enfant"
          value={studentFilter}
          onChange={(event) => setStudentFilter(event.target.value)}
        >
          <option value="all">Tous les enfants</option>
          {familyStudents.map((student) => (
            <option
              key={student.id}
              value={`${student.firstName} ${student.lastName}`}
            >
              {student.firstName} {student.lastName}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrer par mode de paiement"
          value={methodFilter}
          onChange={(event) => setMethodFilter(event.target.value)}
        >
          <option value="all">Tous les modes</option>
          {Array.from(
            new Set(familyPayments.map((payment) => payment.method)),
          ).map((method) => (
            <option key={method}>{method}</option>
          ))}
        </select>
      </CustomScrollbar>
      <section className="card table-card full">
        <div className="card-heading">
          <div>
            <span>Année scolaire 2026 - 2027</span>
            <h3>Historique des paiements</h3>
          </div>
          <small>
            {filteredPayments.length} transaction
            {filteredPayments.length === 1 ? "" : "s"} • {formattedTotal} FCFA
          </small>
        </div>
        <PaymentTable
          rows={filteredPayments}
          onReceipt={(payment) => setModal(`receipt:${payment.reference}`)}
        />
        {filteredPayments.length === 0 && (
          <p className="empty-state">
            Aucun paiement ne correspond à ces filtres.
          </p>
        )}
        <div className="pagination">
          <span>
            {filteredPayments.length} résultat
            {filteredPayments.length === 1 ? "" : "s"}
          </span>
        </div>
      </section>
    </>
  )
}
