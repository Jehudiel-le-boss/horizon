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

export default function AdminStudents() {
  const { students, setModal } = usePortalActions()
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const filteredStudents = students.filter(
    (student) =>
      [
        student.id,
        student.firstName,
        student.lastName,
        student.className,
        student.level,
        student.parent,
      ]
        .join(" ")
        .toLocaleLowerCase("fr")
        .includes(search.toLocaleLowerCase("fr")) &&
      (!levelFilter || student.level === levelFilter) &&
      (!statusFilter || student.status === statusFilter),
  )
  return (
    <>
      <PageIntro
        title="Apprenants"
        text="Gérez les dossiers et la situation financière des 850 apprenants."
        actions={
          <Button icon="plus" onClick={() => setModal("student")}>
            Ajouter un apprenant
          </Button>
        }
      />
      <TableToolbar
        placeholder="Rechercher un apprenant, un parent..."
        onSearch={setSearch}
        levels={["Maternelle", "Primaire", "Secondaire"]}
        statuses={["À jour", "En retard", "À suivre", "Soldé"]}
        onLevelChange={setLevelFilter}
        onStatusChange={setStatusFilter}
      />
      <section className="card data-card">
        <CustomScrollbar className="responsive-table">
          <table>
            <thead>
              <tr>
                {[
                  "ID",
                  "Apprenant",
                  "Classe",
                  "Niveau",
                  "Parent / Tuteur",
                  "Total scolarité",
                  "Payé",
                  "Reste",
                  "Statut",
                  "",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <code>{student.id}</code>
                  </td>
                  <td>
                    <span className="person-cell">
                      <i>
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </i>
                      <b>
                        {student.firstName} {student.lastName}
                      </b>
                    </span>
                  </td>
                  <td>
                    <b>{student.className}</b>
                  </td>
                  <td>{student.level}</td>
                  <td>{student.parent}</td>
                  <td>{student.total}</td>
                  <td className="green-text">{student.paid}</td>
                  <td className={student.remaining === "0" ? "green-text" : ""}>
                    <b>{student.remaining}</b>
                  </td>
                  <td>
                    <Badge
                      tone={
                        student.status === "En retard"
                          ? "danger"
                          : student.status === "À suivre"
                            ? "warning"
                            : "success"
                      }
                    >
                      {student.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="icon-btn"
                      aria-label={`Voir ${student.firstName} ${student.lastName}`}
                      onClick={() => setModal(`student-view:${student.id}`)}
                    >
                      <Icon name="more" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={10} className="empty-table">
                    Aucun apprenant ne correspond à cette recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CustomScrollbar>
        <div className="pagination">
          <span>
            {filteredStudents.length} apprenant
            {filteredStudents.length > 1 ? "s" : ""} affiché
            {filteredStudents.length > 1 ? "s" : ""}
          </span>
        </div>
      </section>
    </>
  )
}
