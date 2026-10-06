"use client"

import { useMemo } from "react"

import { Amount, Badge, Icon, PageIntro } from "@/components/shared/ui"

import { usePortalActions } from "@/components/portal/portal-context"

const feeTemplate = [
  ["Frais d’inscription", 50000],

  ["Frais de scolarité", 350000],

  ["Activités scolaires", 30000],

  ["Transport", 20000],
] as const

const numberFromAmount = (amount: string) => Number(amount.replace(/\D/g, ""))

const formatAmount = (amount: number) =>
  `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`

export default function Fees() {
  const { students, selectedStudentId, selectStudent } = usePortalActions()
  const student =
    students.find((item) => item.id === selectedStudentId) ?? students[0]

  const total = numberFromAmount(student?.total ?? "0")

  const paid = numberFromAmount(student?.paid ?? "0")

  const remaining = numberFromAmount(student?.remaining ?? "0")

  const completion = total ? Math.round((paid / total) * 100) : 0

  const rows = useMemo(
    () =>
      feeTemplate.map(([name, baseAmount]) => {
        const amount = Math.round((baseAmount / 450000) * total)

        const settled = total ? Math.round((amount / total) * paid) : 0

        return {
          name,

          amount,

          paid: settled,

          status: settled >= amount ? "Soldé" : "En cours",
        }
      }),

    [paid, total],
  )

  if (!student) {
    return (
      <PageIntro
        title="Frais scolaires"
        text="Aucun apprenant n’est actuellement associé à votre espace."
      />
    )
  }

  return (
    <>
      <PageIntro
        title="Frais scolaires"
        text={`Détail des contributions pour l’année scolaire 2026 - 2027 • ${student.className}.`}
        actions={
          <select
            aria-label="Choisir un enfant"
            value={selectedStudentId}
            onChange={(event) => selectStudent(event.target.value)}
          >
            {students.map((item) => (
              <option key={item.id} value={item.id}>
                {item.firstName} {item.lastName} — {item.className}
              </option>
            ))}
          </select>
        }
      />
      <div className="summary-band">
        <div>
          <small>Montant total</small>
          <Amount>{formatAmount(total)}</Amount>
        </div>
        <div>
          <small>Montant payé</small>
          <Amount>{formatAmount(paid)}</Amount>
        </div>
        <div>
          <small>Reste à payer</small>
          <Amount>{formatAmount(remaining)}</Amount>
        </div>
        <div className="ring">
          {completion}%<small>réglé</small>
        </div>
      </div>
      <section className="card">
        <div className="card-heading">
          <div>
            <span>Répartition</span>
            <h3>Détail des contributions</h3>
          </div>
          <Badge tone={remaining === 0 ? "success" : "warning"}>
            {remaining === 0 ? "Soldé" : "Paiement en cours"}
          </Badge>
        </div>
        <div className="fee-table">
          <div className="fee-head">
            <span>Libellé</span>
            <span>Montant</span>
            <span>Payé</span>
            <span>Statut</span>
          </div>
          {rows.map((row) => (
            <div className="fee-row" key={row.name}>
              <span>
                <i>
                  <Icon name="file" size={18} />
                </i>
                <b>{row.name}</b>
              </span>
              <span>{formatAmount(row.amount)}</span>
              <span>{formatAmount(row.paid)}</span>
              <Badge tone={row.status === "Soldé" ? "success" : "warning"}>
                {row.status}
              </Badge>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
