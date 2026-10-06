"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { Badge, Button, Icon, PageIntro } from "@/components/shared/ui"

export default function Profile() {
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [preferences, setPreferences] = useState([true, true, false])
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const profileForm = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!passwordOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setPasswordOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [passwordOpen])

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEditing(false)
    setSaved(true)
  }

  function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (data.get("newPassword") !== data.get("confirmPassword")) {
      setPasswordError("Les deux nouveaux mots de passe ne correspondent pas.")
      return
    }
    setPasswordOpen(false)
    setPasswordSaved(true)
    setPasswordError("")
  }

  return (
    <>
      <PageIntro
        title="Mon profil"
        text="Gérez vos informations personnelles et vos préférences."
      />
      <div className="profile-grid">
        <section className="card profile-summary">
          <div className="profile-avatar">AK</div>
          <h3>Aminata Koffi</h3>
          <p>Parent / Tuteur</p>
          <Badge>Compte vérifié</Badge>
          <div>
            <span>
              <Icon name="people" size={18} /> 3 enfants associés
            </span>
            <span>
              <Icon name="calendar" size={18} /> Membre depuis août 2026
            </span>
          </div>
        </section>
        <section className="card form-card">
          <div className="card-heading">
            <div>
              <span>Compte</span>
              <h3>Informations personnelles</h3>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                if (editing) profileForm.current?.reset()
                setEditing((value) => !value)
                setSaved(false)
              }}
            >
              {editing ? "Annuler" : "Modifier"}
            </Button>
          </div>
          <form ref={profileForm} onSubmit={saveProfile}>
            <div className="form-grid">
              <label>
                Nom
                <input
                  name="lastName"
                  defaultValue="Koffi"
                  disabled={!editing}
                />
              </label>
              <label>
                Prénom
                <input
                  name="firstName"
                  defaultValue="Aminata"
                  disabled={!editing}
                />
              </label>
              <label>
                Téléphone
                <input
                  name="phone"
                  defaultValue="+225 07 00 00 00 00"
                  disabled={!editing}
                />
              </label>
              <label>
                Adresse e-mail
                <input
                  name="email"
                  type="email"
                  defaultValue="aminata.koffi@example.com"
                  disabled={!editing}
                />
              </label>
              <label className="span-2">
                Adresse
                <input
                  name="address"
                  defaultValue="Cocody, Abidjan"
                  disabled={!editing}
                />
              </label>
            </div>
            {editing && (
              <div className="modal-actions">
                <Button type="submit">Enregistrer les modifications</Button>
              </div>
            )}
            {saved && (
              <p className="inline-success" role="status">
                Vos informations ont été enregistrées dans cette maquette.
              </p>
            )}
          </form>
        </section>
        <section className="card form-card wide">
          <div className="card-heading">
            <div>
              <span>Préférences</span>
              <h3>Notifications</h3>
            </div>
          </div>
          {[
            [
              "Notifications dans la plateforme",
              "Toujours rester informée dans votre espace",
              true,
            ],
            ["SMS", "Recevoir les rappels importants par SMS", true],
            [
              "E-mail",
              "Recevoir les reçus et récapitulatifs par e-mail",
              false,
            ],
          ].map(([title, text], index) => (
            <div className="toggle-row" key={String(title)}>
              <div>
                <b>{title}</b>
                <small>{text}</small>
              </div>
              <button
                type="button"
                className={`toggle ${preferences[index] ? "on" : ""}`}
                role="switch"
                aria-checked={preferences[index]}
                aria-label={String(title)}
                onClick={() =>
                  setPreferences((current) =>
                    current.map((enabled, i) =>
                      i === index ? !enabled : enabled,
                    ),
                  )
                }
              >
                <i />
              </button>
            </div>
          ))}
        </section>
        <section className="card security-card">
          <span>
            <Icon name="shield" />
          </span>
          <div>
            <h3>Sécurité du compte</h3>
            <p>Mot de passe modifié il y a 3 mois</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setPasswordOpen(true)
              setPasswordSaved(false)
            }}
          >
            Modifier
          </Button>
        </section>
      </div>
      {passwordSaved && (
        <p className="inline-success" role="status">
          Mot de passe mis à jour dans la maquette.
        </p>
      )}
      {passwordOpen && (
        <div
          className="modal-layer"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setPasswordOpen(false)
          }
        >
          <section
            className="modal small"
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-title"
          >
            <button
              className="modal-close"
              onClick={() => setPasswordOpen(false)}
              aria-label="Fermer"
            >
              <Icon name="x" />
            </button>
            <h2 id="password-title">Modifier le mot de passe</h2>
            <form onSubmit={savePassword} className="password-form">
              <label>
                Mot de passe actuel
                <input
                  name="currentPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="current-password"
                />
              </label>
              <label>
                Nouveau mot de passe
                <input
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>
              <label>
                Confirmer le nouveau mot de passe
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>
              {passwordError && (
                <p className="form-error" role="alert">
                  {passwordError}
                </p>
              )}
              <div className="modal-actions">
                <Button
                  variant="secondary"
                  onClick={() => setPasswordOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  )
}
