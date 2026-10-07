"use client"

import { useState } from "react"
import {
  Amount,
  Badge,
  Button,
  Icon,
  PageIntro,
  TableToolbar,
} from "@/components/shared/ui"
import { usePortalActions } from "@/components/portal/portal-context"
import { exportCsv } from "@/lib/export-csv"

export default function AdminReceipts() {
  const { payments, students, setModal } = usePortalActions()
  const [search, setSearch] = useState("")
  const confirmedPayments = payments.filter(
    (payment) => payment.status === "Payé",
  )
  const normalizedSearch = search.toLocaleLowerCase("fr")
  const filteredPayments = confirmedPayments.filter((payment) => {
    const student = students.find(
      (record) => `${record.firstName} ${record.lastName}` === payment.student,
    )
    const searchableText = `${payment.reference} ${payment.student} ${student?.parent ?? ""} ${payment.method}`
    return searchableText.toLocaleLowerCase("fr").includes(normalizedSearch)
  })
  return (
    <>
      <PageIntro
        title="Reçus"
        text="Consultez les reçus validés et exportez leurs données en CSV."
        actions={
          <Button
            variant="secondary"
            icon="download"
            onClick={() =>
              exportCsv("recus-horizon.csv", [
                ["Référence", "Apprenant", "Date", "Mode", "Montant", "Statut"],
                ...confirmedPayments.map((payment) => [
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
            Export groupé
          </Button>
        }
      />
      <TableToolbar
        placeholder="N° de reçu, apprenant, parent..."
        onSearch={setSearch}
        onExport={() =>
          exportCsv("recus-horizon.csv", [
            ["Référence", "Apprenant", "Date", "Mode", "Montant", "Statut"],
            ...filteredPayments.map((payment) => [
              payment.reference,
              payment.student,
              payment.date,
              payment.method,
              payment.amount,
              payment.status,
            ]),
          ])
        }
      />
      <div className="receipt-grid">
        {filteredPayments.map((payment) => (
          <article className="receipt-card" key={payment.reference}>
            <div className="receipt-top">
              <span>
                <Icon name="receipt" />
              </span>
              <Badge>Validé</Badge>
            </div>
            <small>REÇU DE PAIEMENT</small>
            <h3>{payment.reference}</h3>
            <div>
              <span>
                Apprenant <b>{payment.student}</b>
              </span>
              <span>
                Date <b>{payment.date}</b>
              </span>
              <span>
                Mode <b>{payment.method}</b>
              </span>
            </div>
            <Amount>{payment.amount}</Amount>
            <div className="receipt-actions">
              <button onClick={() => setModal(`receipt:${payment.reference}`)}>
                <Icon name="eye" size={17} /> Voir le reçu
              </button>
              <button
                onClick={() =>
                  exportCsv(`${payment.reference}.csv`, [
                    [
                      "Référence",
                      "Apprenant",
                      "Date",
                      "Mode",
                      "Montant",
                      "Statut",
                    ],
                    [
                      payment.reference,
                      payment.student,
                      payment.date,
                      payment.method,
                      payment.amount,
                      payment.status,
                    ],
                  ])
                }
              >
                <Icon name="download" size={17} /> Exporter CSV
              </button>
            </div>
          </article>
        ))}
        {filteredPayments.length === 0 && (
          <p className="card empty-table">
            Aucun reçu validé ne correspond à cette recherche.
          </p>
        )}
      </div>
    </>
  )
}
