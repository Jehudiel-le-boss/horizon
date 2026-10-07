"use client"

import { useState, type FormEvent } from "react"
import { usePortalActions } from "@/components/portal/portal-context"
import {
  Amount,
  Badge,
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

export default function AdminNotifications() {
  const { notifications, classes, sendNotification } = usePortalActions()
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [audience, setAudience] = useState("Tous les parents")
  const [target, setTarget] = useState(classes[0]?.name ?? "Primaire")
  const [channel, setChannel] = useState("Plateforme")
  const [feedback, setFeedback] = useState("")
  const [formError, setFormError] = useState("")
  const recipients =
    audience === "Tous les parents" ? 624 : audience === "Une classe" ? 68 : 128

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() || !message.trim()) {
      setFormError("Le titre et le message ne peuvent pas être vides.")
      return
    }
    setFormError("")
    sendNotification({
      title: title.trim(),
      message: message.trim(),
      audience:
        audience === "Tous les parents"
          ? audience
          : `${audience === "Une classe" ? "Classe" : "Niveau"} ${target}`,
      channel,
      category: "info",
    })
    setTitle("")
    setMessage("")
    setFeedback(
      `Notification ajoutée à l’historique pour ${recipients} parents (démonstration).`,
    )
  }

  return (
    <>
      <PageIntro
        title="Notifications"
        text="Informez les familles au bon moment, sur le bon canal."
        actions={
          <Button
            icon="plus"
            onClick={() => document.querySelector(".compose")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })}
          >
            Nouvelle notification
          </Button>
        }
      />
      <div className="notification-admin-grid">
        <form className="card compose" onSubmit={handleSubmit}>
          <div className="card-heading">
            <div>
              <span>Nouveau message</span>
              <h3>Envoyer une notification</h3>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Destinataires
              <select
                value={audience}
                onChange={(event) => {
                  const nextAudience = event.target.value
                  setAudience(nextAudience)
                  setTarget(
                    nextAudience === "Une classe"
                      ? (classes[0]?.name ?? "")
                      : "Primaire",
                  )
                  setFormError("")
                }}
              >
                <option>Tous les parents</option>
                <option>Une classe</option>
                <option>Un niveau</option>
              </select>
            </label>
            {audience !== "Tous les parents" && (
              <label>
                {audience === "Une classe"
                  ? "Classe concernée"
                  : "Niveau concerné"}
                <select
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                >
                  {(audience === "Une classe"
                    ? classes.map((classItem) => classItem.name)
                    : ["Maternelle", "Primaire", "Secondaire"]
                  ).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Canaux
              <div className="channel-pills">
                <button
                  type="button"
                  className={channel === "Plateforme" ? "active" : ""}
                  onClick={() => setChannel("Plateforme")}
                >
                  <Icon name="bell" size={16} /> Plateforme
                </button>
                <button
                  type="button"
                  className={channel === "SMS" ? "active" : ""}
                  onClick={() => setChannel("SMS")}
                >
                  SMS
                </button>
                <button
                  type="button"
                  className={channel === "E-mail" ? "active" : ""}
                  onClick={() => setChannel("E-mail")}
                >
                  E-mail
                </button>
              </div>
            </label>
            <label className="span-2">
              Titre
              <input
                placeholder="Objet de la notification"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                  setFormError("")
                }}
                required
                maxLength={100}
              />
            </label>
            <label className="span-2">
              Message
              <textarea
                placeholder="Rédigez votre message ici..."
                rows={5}
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value)
                  setFormError("")
                }}
                required
                maxLength={500}
              />
              <small>{message.length} / 500 caractères</small>
            </label>
          </div>
          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}
          <div className="compose-footer">
            <span>
              <Icon name="info" size={16} /> Envoi estimé à {recipients} parents
            </span>
            <Button type="submit">Envoyer la notification</Button>
          </div>
        </form>
        <section className="card sent">
          <div className="card-heading">
            <div>
              <span>Activité récente</span>
              <h3>Derniers envois</h3>
            </div>
          </div>
          {notifications.map((notification) => (
            <div className="sent-row" key={notification.id}>
              <span>
                <Icon name="bell" size={18} />
              </span>
              <div>
                <b>{notification.title}</b>
                <small>
                  {notification.audience} • {notification.channel}
                </small>
              </div>
              <small>{notification.date}</small>
            </div>
          ))}
        </section>
      </div>
      {feedback && (
        <p className="inline-success" role="status">
          {feedback}
        </p>
      )}
    </>
  )
}
