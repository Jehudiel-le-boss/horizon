"use client"

import { useState } from "react"
import {
  Badge,
  Button,
  Icon,
  PageIntro,
  TableToolbar,
} from "@/components/shared/ui"
import { usePortalActions } from "@/components/portal/portal-context"
import { CustomScrollbar } from "@/components/shared/custom-scrollbar"

export default function AdminParents() {
  const { parents, setModal } = usePortalActions()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const filteredParents = parents.filter(
    (parent) =>
      `${parent.name} ${parent.phone} ${parent.email}`
        .toLocaleLowerCase("fr")
        .includes(search.toLocaleLowerCase("fr")) &&
      (!statusFilter || parent.status === statusFilter),
  )
  return (
    <>
      <PageIntro
        title="Parents & tuteurs"
        text="Gérez les comptes famille et leurs informations de contact."
        actions={
          <Button icon="plus" onClick={() => setModal("parent")}>
            Ajouter un parent
          </Button>
        }
      />
      <TableToolbar
        placeholder="Rechercher un parent..."
        onSearch={setSearch}
        statuses={["À jour", "En retard", "À suivre", "Soldé", "Nouveau"]}
        onStatusChange={setStatusFilter}
      />
      <section className="card data-card">
        <CustomScrollbar className="responsive-table">
          <table>
            <thead>
              <tr>
                {[
                  "Parent / Tuteur",
                  "Téléphone",
                  "E-mail",
                  "Enfants",
                  "Montant dû",
                  "Montant payé",
                  "Statut",
                  "",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredParents.map((parent) => (
                <tr key={parent.email}>
                  <td>
                    <span className="person-cell">
                      <i>
                        {parent.name
                          .split(" ")
                          .map((s) => s[0])
                          .join("")}
                      </i>
                      <b>{parent.name}</b>
                    </span>
                  </td>
                  <td>{parent.phone}</td>
                  <td>{parent.email}</td>
                  <td>{parent.children}</td>
                  <td>
                    <b>{parent.due} FCFA</b>
                  </td>
                  <td className="green-text">{parent.paid} FCFA</td>
                  <td>
                    <Badge
                      tone={
                        parent.status === "En retard"
                          ? "danger"
                          : parent.status === "À suivre"
                            ? "warning"
                            : "success"
                      }
                    >
                      {parent.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="icon-btn"
                      aria-label={`Voir ${parent.name}`}
                      onClick={() => setModal(`parent-view:${parent.email}`)}
                    >
                      <Icon name="more" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredParents.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty-table">
                    Aucun parent ne correspond à cette recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CustomScrollbar>
      </section>
    </>
  )
}
