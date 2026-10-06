"use client"

import { Button, Badge, PageIntro } from "@/components/shared/ui"

import { usePortalActions } from "@/components/portal/portal-context"

import { exportCsv } from "@/lib/export-csv"

const amount = (value: string) =>
  new Intl.NumberFormat("fr-FR").format(Number(value.replace(/\D/g, "")))

export default function Children() {
  const { students, setModal } = usePortalActions()

  const familyStudents = students.filter(
    (student) => student.parent === "Aminata Koffi",
  )

  const exportRows = [
    ["Apprenant", "ID", "Classe", "Niveau", "Total", "Payé", "Reste", "Statut"],

    ...familyStudents.map((student) => [
      `${student.firstName} ${student.lastName}`,

      student.id,

      student.className,

      student.level,

      `${student.total} FCFA`,

      `${student.paid} FCFA`,

      `${student.remaining} FCFA`,

      student.status,
    ]),
  ]

  return (
    <>
      <PageIntro
        title="Mes enfants"
        text="Consultez la situation financière de chacun de vos enfants."
        actions={
          <Button
            variant="secondary"
            icon="download"
            onClick={() => exportCsv("releve-familial-horizon.csv", exportRows)}
          >
            Relevé familial
          </Button>
        }
      />
      {familyStudents.length > 0 ? (
        <div className="children-grid">
          {familyStudents.map((student, index) => {
            const total = Number(student.total.replace(/\D/g, ""))

            const paid = Number(student.paid.replace(/\D/g, ""))

            const remaining = Number(student.remaining.replace(/\D/g, ""))

            const progress = total ? Math.round((paid / total) * 100) : 0

            const initials = `${student.firstName[0] ?? ""}${student.lastName[0] ?? ""}`

            return (
              <article className="child-card" key={student.id}>
                <div className={`child-cover cover-${index % 3}`}>
                  <span>{initials}</span>
                  <Badge
                    tone={
                      remaining === 0 || student.status === "À jour"
                        ? "success"
                        : student.status === "En retard"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {student.status}
                  </Badge>
                </div>
                <div className="child-content">
                  <span>{student.level}</span>
                  <h3>
                    {student.firstName} {student.lastName}
                  </h3>
                  <p>{student.className} • 2026 - 2027</p>
                  <div className="child-progress">
                    <div>
                      <span>Progression</span>
                      <b>{progress}%</b>
                    </div>
                    <div className="progress">
                      <span style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="child-amounts">
                    <span>
                      <small>Total scolarité</small>
                      <b>{amount(student.total)} FCFA</b>
                    </span>
                    <span>
                      <small>Reste à payer</small>
                      <b>{amount(student.remaining)} FCFA</b>
                    </span>
                  </div>
                  <Button
                    onClick={() => setModal(`student-view:${student.id}`)}
                  >
                    Voir la situation
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <section className="card empty-state">
          <h3>Aucun enfant associé</h3>
          <p>Les dossiers liés à votre famille apparaîtront ici.</p>
        </section>
      )}
    </>
  )
}
