"use client"

import { useEffect, useMemo, useState } from "react"

import { Amount, Badge, Button, Icon, PageIntro } from "@/components/shared/ui"

import { usePortalActions } from "@/components/portal/portal-context"

type FeeItem = {
  name: string

  amount: number

  enabled: boolean
}

const initialFees: FeeItem[] = [
  { name: "Scolarité", amount: 350000, enabled: true },

  { name: "Inscription", amount: 50000, enabled: true },

  { name: "Cantine", amount: 25000, enabled: false },

  { name: "Transport", amount: 20000, enabled: true },

  { name: "Activités", amount: 30000, enabled: true },

  { name: "Autres contributions", amount: 0, enabled: false },
]

const formatAmount = (amount: number) =>
  `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`

export default function AdminFees() {
  const { classes } = usePortalActions()

  const [fees, setFees] = useState(initialFees)

  const [savedFees, setSavedFees] = useState(initialFees)

  const [level, setLevel] = useState("Primaire")

  const [className, setClassName] = useState("CM2")

  const [editing, setEditing] = useState(false)

  const [saved, setSaved] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const total = useMemo(
    () => fees.reduce((sum, fee) => sum + (fee.enabled ? fee.amount : 0), 0),

    [fees],
  )

  const availableClasses = classes.filter((item) => item.level === level)

  useEffect(() => {
    if (!previewOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setPreviewOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [previewOpen])

  function saveConfiguration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSavedFees(fees.map((fee) => ({ ...fee })))

    setEditing(false)

    setSaved(true)
  }

  function changeAmount(index: number, amount: number) {
    setFees((current) =>
      current.map((fee, i) => (i === index ? { ...fee, amount } : fee)),
    )

    setSaved(false)
  }

  function toggleFee(index: number) {
    setFees((current) =>
      current.map((fee, i) =>
        i === index ? { ...fee, enabled: !fee.enabled } : fee,
      ),
    )

    setSaved(false)
  }

  return (
    <>
      <PageIntro
        title="Frais scolaires"
        text="Configurez les contributions par niveau et par classe."
        actions={
          <Button
            icon="plus"
            onClick={() => {
              setFees(initialFees.map((fee) => ({ ...fee })))

              setSavedFees(initialFees.map((fee) => ({ ...fee })))

              setEditing(true)

              setSaved(false)
            }}
          >
            Nouvelle configuration
          </Button>
        }
      />
      <div className="config-bar">
        <select aria-label="Année scolaire" defaultValue="2026 - 2027">
          <option>2026 - 2027</option>
          <option>2025 - 2026</option>
        </select>
        <select
          aria-label="Niveau"
          value={level}
          onChange={(event) => {
            const nextLevel = event.target.value

            setLevel(nextLevel)

            setClassName(
              classes.find((item) => item.level === nextLevel)?.name ?? "",
            )
          }}
        >
          {["Maternelle", "Primaire", "Secondaire"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          aria-label="Classe"
          value={className}
          onChange={(event) => setClassName(event.target.value)}
        >
          {availableClasses.map((item) => (
            <option key={item.name}>{item.name}</option>
          ))}
        </select>
        <Badge>{editing ? "Brouillon" : "Configuration active"}</Badge>
      </div>
      <div className="dashboard-grid">
        <section className="card form-card">
          <div className="card-heading">
            <div>
              <span>
                {className} • {level}
              </span>
              <h3>Structure des frais</h3>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                if (editing) {
                  setFees(savedFees.map((fee) => ({ ...fee })))

                  setEditing(false)
                } else {
                  setEditing(true)
                }

                setSaved(false)
              }}
            >
              {editing ? "Annuler" : "Modifier"}
            </Button>
          </div>
          <form onSubmit={saveConfiguration}>
            {fees.map((fee, index) => (
              <div className="fee-config" key={fee.name}>
                <button
                  type="button"
                  className={`toggle ${fee.enabled ? "on" : ""}`}
                  role="switch"
                  aria-checked={fee.enabled}
                  disabled={!editing}
                  aria-label={`${
                    fee.enabled ? "Désactiver" : "Activer"
                  } ${fee.name}`}
                  onClick={() => toggleFee(index)}
                >
                  <i />
                </button>
                <span>
                  <b>{fee.name}</b>
                  <small>
                    {fee.enabled ? "Inclus dans le total" : "Désactivé"}
                  </small>
                </span>
                {editing ? (
                  <input
                    aria-label={`Montant ${fee.name}`}
                    className="fee-amount-input"
                    type="number"
                    min="0"
                    step="1000"
                    value={fee.amount}
                    onChange={(event) =>
                      changeAmount(index, Number(event.target.value))
                    }
                  />
                ) : (
                  <strong>
                    {fee.amount > 0 ? formatAmount(fee.amount) : "—"}
                  </strong>
                )}
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Modifier le montant de ${fee.name}`}
                  onClick={() => setEditing(true)}
                >
                  <Icon name="more" />
                </button>
              </div>
            ))}
            {editing && (
              <div className="modal-actions">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFees(savedFees.map((fee) => ({ ...fee })))

                    setEditing(false)
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit">Enregistrer la configuration</Button>
              </div>
            )}
            {saved && (
              <p className="inline-success" role="status">
                Configuration enregistrée localement pour cette démonstration.
              </p>
            )}
          </form>
        </section>
        <section className="card total-panel">
          <span>Montant annuel configuré</span>
          <Amount>{formatAmount(total)}</Amount>
          <div className="donut" />
          <ul>
            {fees
              .filter((fee) => fee.enabled && fee.amount > 0)
              .slice(0, 3)
              .map((fee) => (
                <li key={fee.name}>
                  <i className="blue-dot" /> {fee.name}
                  <b>
                    {total
                      ? `${Math.round((fee.amount / total) * 100)}%`
                      : "0%"}
                  </b>
                </li>
              ))}
          </ul>
          <Button
            variant="secondary"
            icon="eye"
            onClick={() => setPreviewOpen(true)}
          >
            Prévisualiser côté parent
          </Button>
        </section>
      </div>
      {previewOpen && (
        <div
          className="modal-layer"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setPreviewOpen(false)
          }
        >
          <section
            className="modal small"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fee-preview-title"
          >
            <button
              className="modal-close"
              onClick={() => setPreviewOpen(false)}
              aria-label="Fermer"
            >
              <Icon name="x" />
            </button>
            <span>
              {className} • {level}
            </span>
            <h2 id="fee-preview-title">Frais scolaires</h2>
            <p>
              Prévisualisation de ce que les familles verront pour l’année
              scolaire 2026 - 2027.
            </p>
            <div className="fee-table">
              {fees
                .filter((fee) => fee.enabled)
                .map((fee) => (
                  <div className="fee-row" key={fee.name}>
                    <span>
                      <b>{fee.name}</b>
                    </span>
                    <strong>{formatAmount(fee.amount)}</strong>
                  </div>
                ))}
              <div className="fee-row">
                <span>
                  <b>Total annuel</b>
                </span>
                <strong>{formatAmount(total)}</strong>
              </div>
            </div>
            <div className="modal-actions">
              <Button onClick={() => setPreviewOpen(false)}>Fermer</Button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
