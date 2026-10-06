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
  const { payments, setModal } = usePortalActions()
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
        title="Reçus"
        text="Consultez et partagez les reçus générés par la plateforme."
        actions={
          <Button
            variant="secondary"
            icon="download"
            onClick={() =>
              exportCsv("recus-horizon.csv", [
                ["Référence", "Apprenant", "Date", "Mode", "Montant", "Statut"],
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
            Export groupé
          </Button>
        }
      />
      <TableToolbar
        placeholder="N° de reçu, apprenant, parent..."
        onSearch={setSearch}
        statuses={["Payé", "En attente", "Refusé"]}
        onStatusChange={setStatusFilter}
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
                <Icon name="eye" size={17} /> Voir
              </button>
              <button onClick={() => setModal(`receipt:${payment.reference}`)}>
                <Icon name="download" size={17} /> Télécharger
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
