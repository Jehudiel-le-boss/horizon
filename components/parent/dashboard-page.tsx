"use client"

import {
  Amount,
  Badge,
  Button,
  Icon,
  PageIntro,
  PaymentTable,
  StatCard,
  type IconName,
} from "@/components/shared/ui"
import { usePortalActions } from "@/components/portal/portal-context"

export default function ParentDashboard() {
  const { navigate, students, payments, selectedStudentId, selectStudent } =
    usePortalActions()
  const selectedStudent =
    selectedStudentId === "all" ? "all" : selectedStudentId
  const familyStudents = students.filter(
    (student) => student.parent === "Aminata Koffi",
  )
  const visibleStudents =
    selectedStudent === "all"
      ? familyStudents
      : familyStudents.filter((student) => student.id === selectedStudent)
  const total = visibleStudents.reduce(
    (sum, student) => sum + Number(student.total.replace(/\D/g, "")),
    0,
  )
  const paid = visibleStudents.reduce(
    (sum, student) => sum + Number(student.paid.replace(/\D/g, "")),
    0,
  )
  const remaining = visibleStudents.reduce(
    (sum, student) => sum + Number(student.remaining.replace(/\D/g, "")),
    0,
  )
  const formatAmount = (amount: number) =>
    `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`
  const visibleStudentNames = new Set(
    visibleStudents.map(
      (student) => `${student.firstName} ${student.lastName}`,
    ),
  )
  const recentPayments = payments.filter((payment) =>
    visibleStudentNames.has(payment.student),
  )
  const completion = total ? Math.round((paid / total) * 100) : 0
  const nextDueStudent = visibleStudents[0]
  const nextDueAmount = Math.min(
    50000,
    nextDueStudent ? Number(nextDueStudent.remaining.replace(/\D/g, "")) : 0,
  )
  return (
    <>
      <PageIntro
        eyebrow="Mardi 6 octobre 2026"
        title="Bonjour, Aminata"
        text="Voici la situation financière de vos enfants."
        actions={
          <div className="child-select">
            <div>
              <small>Afficher la situation de</small>
              <select
                aria-label="Afficher la situation de"
                value={selectedStudent}
                onChange={(event) => selectStudent(event.target.value)}
              >
                <option value="all">Tous les enfants</option>
                {familyStudents.map((student) => (
                  <option value={student.id} key={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>
            <Icon name="chevron" size={16} />
          </div>
        }
      />
      <div className="notice-banner">
        <span>
          <Icon name="spark" />
        </span>
        <div>
          <b>Votre situation est en bonne voie</b>
          <p>{completion}% des contributions annuelles sont déjà réglées.</p>
        </div>
        <button onClick={() => navigate("schedule")}>
          Voir l’échéancier <Icon name="arrow" size={16} />
        </button>
      </div>
      <div className="stats-grid">
        <StatCard
          icon="school"
          label="Total scolarité"
          value={formatAmount(total)}
          note="Année 2026 - 2027"
        />
        <StatCard
          icon="check"
          label="Déjà payé"
          value={formatAmount(paid)}
          note="+ 100 000 FCFA ce mois"
          tone="green"
        />
        <StatCard
          icon="wallet"
          label="Reste à payer"
          value={formatAmount(remaining)}
          note={`${
            total ? Math.round((remaining / total) * 100) : 0
          }% du montant total`}
          tone="orange"
        />
        <StatCard
          icon="calendar"
          label="Prochaine échéance"
          value="50 000 FCFA"
          note="15 octobre 2026"
          tone="purple"
        />
      </div>
      <div className="dashboard-grid">
        <section className="card progress-card">
          <div className="card-heading">
            <div>
              <span>Progression des paiements</span>
              <h3>Une année bien engagée</h3>
            </div>
            <Badge tone={remaining === 0 ? "success" : "warning"}>
              {remaining === 0 ? "Soldé" : "À suivre"}
            </Badge>
          </div>
          <div className="progress-numbers">
            <div>
              <Amount>{new Intl.NumberFormat("fr-FR").format(paid)}</Amount>
              <small> FCFA payés</small>
            </div>
            <b>{completion}%</b>
          </div>
          <div className="progress xl">
            <span style={{ width: `${completion}%` }} />
          </div>
          <div className="progress-labels">
            <span>0 FCFA</span>
            <span>{formatAmount(remaining)} restant</span>
            <span>{formatAmount(total)}</span>
          </div>
          <div className="progress-footer">
            <span>
              <Icon name="info" size={16} /> Prochaine étape : 50 000 FCFA avant
              le 15 octobre
            </span>
            <button onClick={() => navigate("fees")}>Voir le détail</button>
          </div>
        </section>
        <section className="card due-card">
          <div className="card-heading">
            <div>
              <span>Prochaine échéance</span>
              <h3>Tranche n°3</h3>
            </div>
            <span className="date-tile">
              <b>15</b>
              <small>OCT</small>
            </span>
          </div>
          <Amount>{formatAmount(nextDueAmount)}</Amount>
          <p>
            Pour{" "}
            {nextDueStudent
              ? `${nextDueStudent.firstName} ${nextDueStudent.lastName} • ${nextDueStudent.className}`
              : "votre famille"}
          </p>
          <div className="countdown">
            <Icon name="clock" size={17} />
            <span>Dans 9 jours</span>
          </div>
          <Button onClick={() => navigate("schedule")}>
            Voir l’échéancier
          </Button>
        </section>
      </div>
      <div className="dashboard-grid lower">
        <section className="card table-card">
          <div className="card-heading">
            <div>
              <span>Activité récente</span>
              <h3>Derniers paiements</h3>
            </div>
            <button onClick={() => navigate("payments")}>
              Voir tout <Icon name="arrow" size={16} />
            </button>
          </div>
          <PaymentTable compact rows={recentPayments} />
        </section>
        <section className="card reminders">
          <div className="card-heading">
            <div>
              <span>Informations utiles</span>
              <h3>À retenir</h3>
            </div>
            <span className="count">3</span>
          </div>
          {[
            [
              "calendar",
              "Votre prochaine échéance est dans 9 jours.",
              "Aujourd’hui",
              "warning",
            ],
            [
              "check",
              "Votre paiement de 100 000 FCFA a été enregistré.",
              "2 sept.",
              "success",
            ],
            [
              "wallet",
              "Il reste 150 000 FCFA à régler.",
              "Année 2026-27",
              "info",
            ],
          ].map(([icon, text, date, tone]) => (
            <div className="reminder" key={text}>
              <span className={`mini-icon ${tone}`}>
                <Icon name={icon as IconName} />
              </span>
              <div>
                <b>{text}</b>
                <small>{date}</small>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}
