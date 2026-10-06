"use client"

import { Button, Icon, PageIntro } from "@/components/shared/ui"
import { usePortalActions } from "@/components/portal/portal-context"
import { mockStudents } from "@/lib/mock-data"

export default function AdminClasses() {
  const { classes, students, setModal } = usePortalActions()
  const originalStudentIds = new Set(mockStudents.map((student) => student.id))
  const addedStudents = students.filter(
    (student) => !originalStudentIds.has(student.id),
  )
  const baselineByLevel = {
    Maternelle: 128,
    Primaire: 392,
    Secondaire: 330,
  }
  const levelConfig = [
    { name: "Maternelle", tone: "purple" },
    { name: "Primaire", tone: "blue" },
    { name: "Secondaire", tone: "orange" },
  ] as const
  return (
    <>
      <PageIntro
        title="Classes & niveaux"
        text="Configurez la structure pédagogique utilisée pour les contributions."
        actions={
          <Button icon="plus" onClick={() => setModal("class")}>
            Ajouter une classe
          </Button>
        }
      />
      <div className="level-summary">
        <span>
          <b>
            {
              levelConfig.filter((level) =>
                classes.some((item) => item.level === level.name),
              ).length
            }
          </b>
          <small>Niveaux</small>
        </span>
        <span>
          <b>{classes.length}</b>
          <small>Classes</small>
        </span>
        <span>
          <b>{850 + addedStudents.length}</b>
          <small>Apprenants</small>
        </span>
      </div>
      <div className="level-grid">
        {levelConfig.map(({ name, tone }) => {
          const levelClasses = classes.filter((item) => item.level === name)
          return (
            <section className={`card level-card ${tone}`} key={name}>
              <div className="level-head">
                <span>
                  <Icon name="school" />
                </span>
                <div>
                  <h3>{name}</h3>
                  <p>
                    {levelClasses.length} classes •{" "}
                    {baselineByLevel[name] +
                      addedStudents.filter((student) => student.level === name)
                        .length}{" "}
                    apprenants
                  </p>
                </div>
                <button
                  aria-label={`Ajouter une classe à ${name}`}
                  onClick={() => setModal(`class:${name}`)}
                >
                  <Icon name="more" />
                </button>
              </div>
              <div className="class-list">
                {levelClasses.map((classItem, index) => (
                  <div key={classItem.name}>
                    <span>{classItem.name}</span>
                    <small>
                      {18 +
                        index * 7 +
                        addedStudents.filter(
                          (student) => student.className === classItem.name,
                        ).length}{" "}
                      apprenants
                    </small>
                    <Icon name="chevron" size={16} />
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                icon="plus"
                onClick={() => setModal(`class:${name}`)}
              >
                Ajouter une classe
              </Button>
            </section>
          )
        })}
      </div>
    </>
  )
}
