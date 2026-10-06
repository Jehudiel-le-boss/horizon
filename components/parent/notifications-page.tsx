"use client"

import { useState } from "react"
import { Button, Icon, PageIntro } from "@/components/shared/ui"
import { usePortalActions } from "@/components/portal/portal-context"

export default function Notifications() {
  const {
    parentNotifications,
    markAllNotificationsRead,
    markNotificationRead,
  } = usePortalActions()
  const [filter, setFilter] = useState<"all" | "payment" | "due" | "info">(
    "all",
  )
  const notes = parentNotifications.filter(
    (note) => filter === "all" || note.category === filter,
  )
  return (
    <>
      <PageIntro
        title="Notifications"
        text="Restez informée des paiements et des prochaines échéances."
        actions={
          <Button variant="ghost" onClick={markAllNotificationsRead}>
            Tout marquer comme lu
          </Button>
        }
      />
      <div className="tabs">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          Toutes <i>{parentNotifications.length}</i>
        </button>
        <button
          className={filter === "payment" ? "active" : ""}
          onClick={() => setFilter("payment")}
        >
          Paiements
        </button>
        <button
          className={filter === "due" ? "active" : ""}
          onClick={() => setFilter("due")}
        >
          Échéances
        </button>
        <button
          className={filter === "info" ? "active" : ""}
          onClick={() => setFilter("info")}
        >
          Informations
        </button>
      </div>
      <section className="notification-list">
        {notes.map((note) => (
          <article className={note.read ? "" : "unread"} key={note.id}>
            <span
              className={`notification-icon ${
                note.category === "due"
                  ? "warning"
                  : note.category === "payment"
                    ? "success"
                    : "info"
              }`}
            >
              <Icon
                name={
                  note.category === "due"
                    ? "calendar"
                    : note.category === "payment"
                      ? "check"
                      : "info"
                }
              />
            </span>
            <div>
              <h3>{note.title}</h3>
              <p>{note.message}</p>
              <small>{note.date}</small>
            </div>
            {!note.read && <i className="unread-dot" />}
            <button
              aria-label={`Marquer comme lu : ${note.title}`}
              onClick={() => markNotificationRead(note.id)}
            >
              <Icon name="more" />
            </button>
          </article>
        ))}
        {notes.length === 0 && (
          <p className="empty-state">
            Aucune notification dans cette catégorie.
          </p>
        )}
      </section>
    </>
  )
}
