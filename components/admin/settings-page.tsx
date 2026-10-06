"use client"

import { useRef, useState, type FormEvent } from "react"

import {
  Badge,
  Button,
  Icon,
  Logo,
  PageIntro,
  type IconName,
} from "@/components/shared/ui"

const settingTabs: [string, IconName, string][] = [
  ["school", "school", "Établissement"],

  ["year", "calendar", "Année scolaire"],

  ["users", "people", "Utilisateurs"],

  ["alerts", "bell", "Notifications"],

  ["security", "shield", "Sécurité"],
]

export default function Settings() {
  const [tab, setTab] = useState("school")

  const [saved, setSaved] = useState(false)

  const [reminders, setReminders] = useState([true, true, false])
  const [savedReminders, setSavedReminders] = useState([true, true, false])

  const [requireTwoFactor, setRequireTwoFactor] = useState(false)
  const [savedTwoFactor, setSavedTwoFactor] = useState(false)

  const [users, setUsers] = useState([
    "direction@horizon.edu",

    "comptabilite@horizon.edu",
  ])

  const [newUser, setNewUser] = useState("")

  const [savedUsers, setSavedUsers] = useState([
    "direction@horizon.edu",
    "comptabilite@horizon.edu",
  ])

  const [userError, setUserError] = useState("")

  const [logoName, setLogoName] = useState("")
  const [savedLogoName, setSavedLogoName] = useState("")

  const logoInput = useRef<HTMLInputElement>(null)
  const settingsForm = useRef<HTMLFormElement>(null)

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSavedReminders([...reminders])
    setSavedTwoFactor(requireTwoFactor)
    setSavedUsers([...users])
    setSavedLogoName(logoName)
    setSaved(true)
  }

  function cancelChanges() {
    settingsForm.current?.reset()
    setReminders([...savedReminders])
    setRequireTwoFactor(savedTwoFactor)
    setUsers([...savedUsers])
    setLogoName(savedLogoName)
    setNewUser("")
    setUserError("")
    setSaved(false)
  }

  function addUser() {
    const email = newUser.trim()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setUserError("Saisissez une adresse e-mail valide.")

      return
    }

    if (users.includes(email)) {
      setUserError("Cet utilisateur est déjà dans la liste.")

      return
    }

    setUsers((current) => [...current, email])

    setNewUser("")

    setUserError("")

    setSaved(false)
  }

  const activeTitle =
    settingTabs.find(([key]) => key === tab)?.[2] ?? "Paramètres"

  return (
    <>
      <PageIntro
        title="Paramètres"
        text="Configurez votre établissement et les règles de la plateforme."
      />
      <div className="settings-layout">
        <nav aria-label="Catégories de paramètres">
          {settingTabs.map(([key, icon, label]) => (
            <button
              type="button"
              className={tab === key ? "active" : ""}
              onClick={() => {
                setTab(key)

                setSaved(false)
              }}
              key={key}
              aria-current={tab === key ? "page" : undefined}
            >
              <Icon name={icon} />
              {label}
              <Icon name="chevron" size={15} />
            </button>
          ))}
        </nav>
        <section className="card settings-content">
          <div className="card-heading">
            <div>
              <span>{activeTitle}</span>
              <h3>
                {tab === "school"
                  ? "Informations de l’établissement"
                  : tab === "year"
                    ? "Année scolaire"
                    : tab === "users"
                      ? "Utilisateurs autorisés"
                      : tab === "alerts"
                        ? "Rappels automatiques"
                        : "Sécurité du compte"}
              </h3>
            </div>
            {tab === "school" && <Badge>Maquette</Badge>}
          </div>
          <form
            ref={settingsForm}
            onSubmit={save}
            onChange={() => setSaved(false)}
          >
            {tab === "school" ? (
              <>
                <div className="logo-upload">
                  <Logo />
                  <div>
                    <b>Logo de l’établissement</b>
                    <small>{logoName || "PNG ou JPG, 2 Mo maximum"}</small>
                  </div>
                  <input
                    ref={logoInput}
                    type="file"
                    accept="image/png,image/jpeg"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0]

                      if (!file) return

                      if (file.size > 2 * 1024 * 1024) {
                        setLogoName("Le fichier dépasse la limite de 2 Mo.")

                        return
                      }

                      setLogoName(file.name)

                      setSaved(false)
                    }}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => logoInput.current?.click()}
                  >
                    Choisir un fichier
                  </Button>
                </div>
                <div className="form-grid">
                  <label className="span-2">
                    Nom de l’établissement
                    <input defaultValue="Complexe Scolaire Horizon" required />
                  </label>
                  <label>
                    Téléphone
                    <input
                      defaultValue="+225 27 22 00 00 00"
                      type="tel"
                      required
                    />
                  </label>
                  <label>
                    Adresse e-mail
                    <input
                      defaultValue="contact@horizon.edu"
                      type="email"
                      required
                    />
                  </label>
                  <label className="span-2">
                    Adresse
                    <input defaultValue="Cocody Riviera, Abidjan" required />
                  </label>
                </div>
              </>
            ) : tab === "year" ? (
              <div className="form-grid">
                <label>
                  Année actuelle
                  <input defaultValue="2026 - 2027" required />
                </label>
                <label>
                  Statut
                  <select defaultValue="active">
                    <option value="active">Année active</option>
                    <option value="archived">Archivée</option>
                  </select>
                </label>
                <label>
                  Date de début
                  <input type="date" defaultValue="2026-09-01" required />
                </label>
                <label>
                  Date de fin
                  <input type="date" defaultValue="2027-06-30" required />
                </label>
              </div>
            ) : tab === "users" ? (
              <div className="settings-users">
                <p>
                  Les personnes ci-dessous disposent d’un accès administrateur à
                  la maquette.
                </p>
                {users.map((email) => (
                  <div className="toggle-row" key={email}>
                    <div>
                      <b>{email}</b>
                      <small>Administrateur</small>
                    </div>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Retirer ${email}`}
                      onClick={() => {
                        setUsers((current) =>
                          current.filter((user) => user !== email),
                        )
                        setSaved(false)
                      }}
                    >
                      <Icon name="x" />
                    </button>
                  </div>
                ))}
                <div className="add-user-row">
                  <input
                    type="email"
                    aria-label="Adresse e-mail du nouvel utilisateur"
                    placeholder="nom@horizon.edu"
                    value={newUser}
                    onChange={(event) => {
                      setNewUser(event.target.value)
                      setUserError("")
                    }}
                  />
                  <Button type="button" icon="plus" onClick={addUser}>
                    Ajouter
                  </Button>
                </div>
                {userError && (
                  <p className="form-error" role="alert">
                    {userError}
                  </p>
                )}
              </div>
            ) : tab === "alerts" ? (
              <div className="settings-users">
                {[
                  [
                    "Rappels d’échéance",
                    "Prévenir les familles avant la date limite.",
                  ],

                  [
                    "Confirmation de paiement",
                    "Envoyer une confirmation après chaque règlement.",
                  ],

                  [
                    "Résumé hebdomadaire",
                    "Recevoir un rapport chaque semaine.",
                  ],
                ].map(([label, description], index) => (
                  <div className="toggle-row" key={label}>
                    <div>
                      <b>{label}</b>
                      <small>{description}</small>
                    </div>
                    <button
                      type="button"
                      className={`toggle ${reminders[index] ? "on" : ""}`}
                      role="switch"
                      aria-checked={reminders[index]}
                      aria-label={label}
                      onClick={() => {
                        setReminders((current) =>
                          current.map((enabled, i) =>
                            i === index ? !enabled : enabled,
                          ),
                        )
                        setSaved(false)
                      }}
                    >
                      <i />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="settings-users">
                <div className="toggle-row">
                  <div>
                    <b>Authentification à deux facteurs</b>
                    <small>
                      Exiger une vérification supplémentaire à la connexion.
                    </small>
                  </div>
                  <button
                    type="button"
                    className={`toggle ${requireTwoFactor ? "on" : ""}`}
                    role="switch"
                    aria-checked={requireTwoFactor}
                    onClick={() => {
                      setRequireTwoFactor((enabled) => !enabled)
                      setSaved(false)
                    }}
                  >
                    <i />
                  </button>
                </div>
                <label className="security-timeout">
                  Déconnexion automatique
                  <select defaultValue="30">
                    <option value="15">Après 15 minutes</option>
                    <option value="30">Après 30 minutes</option>
                    <option value="60">Après 1 heure</option>
                  </select>
                </label>
              </div>
            )}
            <div className="settings-footer">
              <Button variant="secondary" onClick={cancelChanges}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer les modifications</Button>
            </div>
            {saved && (
              <p className="inline-success" role="status">
                Paramètres enregistrés pour cette démonstration.
              </p>
            )}
          </form>
        </section>
      </div>
    </>
  )
}
