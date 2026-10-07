"use client"

import { useEffect, useState, type FormEvent } from "react"

import { Badge, Button, Icon, Logo } from "@/components/shared/ui"

import { usePortalActions } from "@/components/portal/portal-context"
import { formatXofAmount, parseXofDisplayAmount } from "@/lib/domain/money"
import {
  classInputSchema,
  createManualPaymentSchema,
  parentInputSchema,
  paymentPlanInputSchema,
  studentInputSchema,
} from "@/lib/domain/validation"

function getFirstValidationMessage(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Vérifiez les informations saisies."
}

export default function Modal({
  type,

  close,
}: {
  type: string

  close: () => void
}) {
  const {
    students,

    parents,

    payments,

    classes,

    setModal,

    navigate,

    selectStudent,

    createStudent,

    createParent,

    createPayment,

    createClass,

    createPaymentPlan,

    paymentPlans,

    updatePaymentPlan,

    removePaymentPlan,
  } = usePortalActions()

  const [action, value = ""] = type.split(/:(.*)/, 2)

  const [success, setSuccess] = useState("")

  const [formError, setFormError] = useState("")

  const [successReceipt, setSuccessReceipt] = useState("")

  const [classLevel, setClassLevel] = useState(() =>
    action.startsWith("class:") ? value : "Primaire",
  )

  const [className, setClassName] = useState("")

  const [classError, setClassError] = useState("")

  const [studentLevel, setStudentLevel] = useState("Maternelle")

  const [studentClass, setStudentClass] = useState(
    () => classes.find((item) => item.level === "Maternelle")?.name ?? "",
  )

  const [selectedPaymentParent, setSelectedPaymentParent] = useState(
    parents[0]?.name ?? "",
  )

  const [selectedPaymentStudent, setSelectedPaymentStudent] = useState(
    students.find((item) => item.parent === parents[0]?.name)?.id ??
      students[0]?.id ??
      "",
  )

  const paymentParents = parents.filter((parent) =>
    students.some((student) => student.parent === parent.name),
  )

  const [receiptError, setReceiptError] = useState("")

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const previousBodyOverflow = document.body.style.overflow
    const dialog = document.querySelector<HTMLElement>(
      ".modal-layer [role='dialog']",
    )

    document.body.style.overflow = "hidden"

    if (dialog) {
      dialog.tabIndex = -1
      const formTarget = dialog.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])',
      )
      const fallbackTarget = dialog.querySelector<HTMLElement>(
        "button:not([disabled])",
      )
      ;(formTarget ?? fallbackTarget ?? dialog).focus()
    }

    function getFocusableElements() {
      return Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter(
        (element) =>
          element.getAttribute("aria-hidden") !== "true" &&
          element.getClientRects().length > 0,
      )
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        close()
        return
      }

      if (event.key !== "Tab" || !dialog) return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]

      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousBodyOverflow
      if (
        previouslyFocused &&
        previouslyFocused !== document.body &&
        previouslyFocused.isConnected
      ) {
        window.requestAnimationFrame(() => {
          if (previouslyFocused.isConnected) previouslyFocused.focus()
        })
      }
    }
  }, [close])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setFormError("")

    const data = new FormData(event.currentTarget)

    const get = (name: string) => String(data.get(name) ?? "").trim()

    if (action === "payment") {
      const student = students.find((item) => item.id === get("student"))

      if (!student) {
        setFormError("Sélectionnez un apprenant valide.")

        return
      }

      const paymentResult = createManualPaymentSchema(
        parseXofDisplayAmount(student.remaining),
      ).safeParse({
        studentId: get("student"),
        amount: get("amount"),
        date: get("date"),
        method: get("method"),
        reference: get("reference"),
        comment: get("comment"),
      })

      if (!paymentResult.success) {
        setFormError(getFirstValidationMessage(paymentResult.error))

        return
      }

      if (payments.some((payment) => payment.reference === get("reference"))) {
        setFormError("Cette référence de paiement existe déjà.")

        return
      }

      const payment = paymentResult.data

      const date = new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",

        month: "short",

        year: "numeric",
      }).format(new Date(`${get("date")}T12:00:00`))

      createPayment({
        date,
        dateISO: payment.date,

        student: `${student.firstName} ${student.lastName}`,

        reference: payment.reference,

        amount: `${formatXofAmount(payment.amount)} FCFA`,

        method: payment.method,

        note: payment.comment,
      })

      setSuccessReceipt(payment.reference)

      setSuccess(
        "Le paiement a été enregistré dans les données de démonstration.",
      )

      return
    }

    if (action === "student") {
      const studentResult = studentInputSchema.safeParse({
        firstName: get("firstName"),
        lastName: get("lastName"),
        className: get("className"),
        level: get("level"),
        parent: get("parent"),
        total: get("total"),
      })

      if (!studentResult.success) {
        setFormError(getFirstValidationMessage(studentResult.error))

        return
      }

      const studentInput = studentResult.data

      if (!parents.some((parent) => parent.name === studentInput.parent)) {
        setFormError("Sélectionnez un parent existant.")

        return
      }

      createStudent({
        firstName: studentInput.firstName,

        lastName: studentInput.lastName,

        className: studentInput.className,

        level: studentInput.level,

        parent: studentInput.parent,

        total: formatXofAmount(studentInput.total),
      })

      setSuccess("Le dossier apprenant a été ajouté à la liste mockée.")

      return
    }

    if (action === "parent") {
      const parentResult = parentInputSchema.safeParse({
        firstName: get("firstName"),
        lastName: get("lastName"),
        phone: get("phone"),
        email: get("email"),
      })

      if (!parentResult.success) {
        setFormError(getFirstValidationMessage(parentResult.error))

        return
      }

      const parentInput = parentResult.data

      if (
        parents.some(
          (parent) => parent.email.toLocaleLowerCase() === parentInput.email,
        )
      ) {
        setFormError("Un parent utilise déjà cette adresse e-mail.")

        return
      }

      createParent({
        name: `${parentInput.firstName} ${parentInput.lastName}`,

        phone: parentInput.phone,

        email: parentInput.email,
      })

      setSuccess("Le parent a été ajouté à la liste mockée.")

      return
    }

    if (action === "class" || action.startsWith("class-")) {
      const classResult = classInputSchema.safeParse({
        name: get("name"),
        level: get("level"),
      })

      if (!classResult.success) {
        setClassError(getFirstValidationMessage(classResult.error))

        return
      }

      const { name, level } = classResult.data

      if (
        classes.some(
          (item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
        )
      ) {
        setClassError("Une classe porte déjà ce nom.")

        return
      }

      createClass({ name, level })

      setSuccess(`La classe ${name} a été ajoutée à ${level.toLowerCase()}.`)

      return
    }

    if (action === "plan" || action === "plan-edit") {
      const planName = get("name")

      if (
        paymentPlans.some(
          (plan) =>
            plan.name.toLocaleLowerCase() === planName.toLocaleLowerCase() &&
            !(action === "plan-edit" && plan.name === value),
        )
      ) {
        setFormError("Un plan porte déjà ce nom.")

        return
      }

      const planResult = paymentPlanInputSchema.safeParse({
        name: planName,
        amount: get("amount"),
        installments: get("installments"),
      })

      if (!planResult.success) {
        setFormError(getFirstValidationMessage(planResult.error))

        return
      }

      const planInput = planResult.data
      const record = {
        name: planInput.name,

        amount: `${formatXofAmount(planInput.amount)} FCFA`,

        installments: `${planInput.installments} tranches`,

        students:
          paymentPlans.find((plan) => plan.name === value)?.students ??
          "0 apprenant",

        status: "Actif",
      }

      if (action === "plan-edit") {
        updatePaymentPlan(value, record)

        setSuccess("Le plan a été modifié dans les données de démonstration.")
      } else {
        createPaymentPlan(record)

        setSuccess("Le plan a été ajouté aux échéanciers mockés.")
      }
    }
  }

  function downloadReceipt() {
    const payment = payments.find((item) => item.reference === value)

    if (!payment) {
      setReceiptError(
        "Ce reçu n’est plus disponible dans les données de démonstration.",
      )

      return
    }

    const content = [
      "COMPLEXE SCOLAIRE HORIZON — REÇU DE PAIEMENT",

      `Référence : ${payment.reference}`,

      `Parent / tuteur : ${parents.find((item) => item.name === students.find((student) => `${student.firstName} ${student.lastName}` === payment.student)?.parent)?.name ?? "Famille Horizon"}`,

      `Apprenant : ${payment.student}`,

      `Date : ${payment.date}`,

      `Mode : ${payment.method}`,

      `Montant : ${payment.amount}`,
    ].join("\n")

    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain;charset=utf-8" }),
    )

    const link = document.createElement("a")

    link.href = url

    link.download = `${payment.reference}.txt`

    link.click()

    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  if (success) {
    return (
      <div
        className="modal-layer"
        onMouseDown={(event) => event.target === event.currentTarget && close()}
      >
        <section
          className="modal small success-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-success-title"
        >
          <button className="modal-close" onClick={close} aria-label="Fermer">
            <Icon name="x" />
          </button>
          <span className="success-orb done">
            <Icon name="check" />
          </span>
          <h2 id="modal-success-title">C’est enregistré</h2>
          <p>{success}</p>
          <div className="modal-actions">
            {successReceipt && (
              <Button
                variant="secondary"
                icon="receipt"
                onClick={() => setModal(`receipt:${successReceipt}`)}
              >
                Voir le reçu
              </Button>
            )}
            <Button onClick={close}>Fermer</Button>
          </div>
        </section>
      </div>
    )
  }

  if (action === "receipt") {
    const payment = payments.find((item) => item.reference === value)

    const student =
      payment &&
      students.find(
        (item) => `${item.firstName} ${item.lastName}` === payment.student,
      )

    const parent =
      student && parents.find((item) => item.name === student.parent)

    if (!payment || payment.status !== "Payé") {
      return (
        <div
          className="modal-layer"
          onMouseDown={(event) =>
            event.target === event.currentTarget && close()
          }
        >
          <section
            className="modal small"
            role="dialog"
            aria-modal="true"
            aria-labelledby="receipt-error-title"
          >
            <button className="modal-close" onClick={close} aria-label="Fermer">
              <Icon name="x" />
            </button>
            <h2 id="receipt-error-title">
              {payment ? "Reçu non disponible" : "Reçu introuvable"}
            </h2>
            <p>
              {payment
                ? "Un reçu est disponible uniquement après confirmation du paiement."
                : "La référence demandée n’est pas présente dans les données mockées."}
            </p>
            <div className="modal-actions">
              <Button onClick={close}>Fermer</Button>
            </div>
          </section>
        </div>
      )
    }

    return (
      <div
        className="modal-layer"
        onMouseDown={(event) => event.target === event.currentTarget && close()}
      >
        <section
          className="modal receipt-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="receipt-title"
        >
          <button className="modal-close" onClick={close} aria-label="Fermer">
            <Icon name="x" />
          </button>
          <div className="digital-receipt">
            <div className="receipt-brand">
              <Logo />
              <span>
                <b id="receipt-title">REÇU DE PAIEMENT</b>
                <small>Original numérique</small>
              </span>
            </div>
            <div className="receipt-number">
              <span>Référence</span>
              <b>{payment.reference}</b>
              <Badge>Validé</Badge>
            </div>
            <div className="receipt-details">
              {[
                ["Parent / Tuteur", parent?.name ?? "Famille Horizon"],

                ["Apprenant", payment.student],

                ["Classe", student?.className ?? "—"],

                ["Date", payment.date],

                ["Mode de paiement", payment.method],

                ["Montant payé", payment.amount],
              ].map(([label, detail]) => (
                <span key={label}>
                  <small>{label}</small>
                  <b>{detail}</b>
                </span>
              ))}
            </div>
            {student && (
              <div className="receipt-balance">
                <span>
                  <small>Solde avant paiement</small>
                  <b>
                    {new Intl.NumberFormat("fr-FR").format(
                      parseXofDisplayAmount(student.remaining) +
                        parseXofDisplayAmount(payment.amount),
                    )}{" "}
                    FCFA
                  </b>
                </span>
                <Icon name="arrow" />
                <span>
                  <small>Solde après paiement</small>
                  <b>{student.remaining} FCFA</b>
                </span>
              </div>
            )}
            <div className="stamp">
              <Icon name="check" />
              <span>
                PAYÉ<small>Complexe Scolaire Horizon</small>
              </span>
            </div>
            <p>Merci pour votre confiance. Ce reçu numérique fait foi.</p>
          </div>
          {receiptError && (
            <p role="alert" className="form-error">
              {receiptError}
            </p>
          )}
          <div className="modal-actions">
            <Button variant="ghost" onClick={close}>
              Retour
            </Button>
            <Button
              variant="secondary"
              icon="download"
              onClick={downloadReceipt}
            >
              Télécharger
            </Button>
            <Button icon="file" onClick={() => window.print()}>
              Imprimer
            </Button>
          </div>
        </section>
      </div>
    )
  }

  if (action === "delete") {
    return (
      <div
        className="modal-layer"
        onMouseDown={(event) => event.target === event.currentTarget && close()}
      >
        <section
          className="modal small"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <button className="modal-close" onClick={close} aria-label="Fermer">
            <Icon name="x" />
          </button>
          <span className="danger-orb">
            <Icon name="file" />
          </span>
          <h2 id="delete-title">Supprimer ce plan ?</h2>
          <p>Le plan « {value} » sera retiré de la liste de démonstration.</p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={close}>
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                removePaymentPlan(value)
                close()
              }}
            >
              Supprimer
            </Button>
          </div>
        </section>
      </div>
    )
  }

  if (action === "parent-view") {
    const parent = parents.find((item) => item.email === value)

    return (
      <div
        className="modal-layer"
        onMouseDown={(event) => event.target === event.currentTarget && close()}
      >
        <section
          className="modal small"
          role="dialog"
          aria-modal="true"
          aria-labelledby="parent-view-title"
        >
          <button className="modal-close" onClick={close} aria-label="Fermer">
            <Icon name="x" />
          </button>
          <h2 id="parent-view-title">{parent?.name ?? "Parent introuvable"}</h2>
          {parent && (
            <p>
              {parent.phone}
              <br />
              {parent.email}
              <br />
              {parent.children} enfant(s) associé(s)
            </p>
          )}
          <div className="modal-actions">
            <Button onClick={close}>Fermer</Button>
          </div>
        </section>
      </div>
    )
  }

  if (action === "student-view") {
    const student = students.find((item) => item.id === value)

    return (
      <div
        className="modal-layer"
        onMouseDown={(event) => event.target === event.currentTarget && close()}
      >
        <section
          className="modal small"
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-view-title"
        >
          <button className="modal-close" onClick={close} aria-label="Fermer">
            <Icon name="x" />
          </button>
          <h2 id="student-view-title">
            {student
              ? `${student.firstName} ${student.lastName}`
              : "Apprenant introuvable"}
          </h2>
          {student && (
            <p>
              {student.id} • {student.className}
              <br />
              Parent : {student.parent}
              <br />
              Frais : {student.total} FCFA
              <br />
              Payé : {student.paid} FCFA
              <br />
              Solde : {student.remaining} FCFA
            </p>
          )}
          <div className="modal-actions">
            <Button variant="secondary" onClick={close}>
              Fermer
            </Button>
            <Button
              onClick={() => {
                if (student) selectStudent(student.id)
                close()
                navigate("fees")
              }}
            >
              Voir les frais
            </Button>
          </div>
        </section>
      </div>
    )
  }

  const isPayment = action === "payment"

  const isParent = action === "parent"

  const isClass = action === "class" || action.startsWith("class-")

  const isPlan = action === "plan" || action === "plan-edit"

  const planToEdit =
    action === "plan-edit"
      ? paymentPlans.find((plan) => plan.name === value)
      : undefined

  const matchingStudents = students.filter(
    (student) => student.parent === selectedPaymentParent,
  )

  const paymentStudentOptions = matchingStudents.length
    ? matchingStudents
    : students
  const selectedPaymentStudentRecord = students.find(
    (student) => student.id === selectedPaymentStudent,
  )

  const initialLevel = action.startsWith("class:") ? value : "Primaire"

  return (
    <div
      className="modal-layer"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <section
        className="modal form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
      >
        <button className="modal-close" onClick={close} aria-label="Fermer">
          <Icon name="x" />
        </button>
        <div className="modal-heading">
          <span className="modal-icon">
            <Icon name={isPayment ? "money" : isClass ? "school" : "user"} />
          </span>
          <div>
            <h2 id="form-title">
              {isPayment
                ? "Enregistrer un paiement"
                : isParent
                  ? "Ajouter un parent"
                  : isClass
                    ? "Ajouter une classe"
                    : isPlan
                      ? "Créer un plan de paiement"
                      : "Ajouter un apprenant"}
            </h2>
            <p>
              {isPayment
                ? "Renseignez les informations du règlement reçu."
                : isParent
                  ? "Les coordonnées seront ajoutées à la liste mockée."
                  : isClass
                    ? "Complétez la structure pédagogique de démonstration."
                    : isPlan
                      ? "Définissez un plan visible dans les échéanciers."
                      : "Créez un dossier et associez son responsable."}
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {isPayment ? (
              <>
                <label>
                  Parent / Tuteur
                  <select
                    name="parent"
                    required
                    value={selectedPaymentParent}
                    onChange={(event) => {
                      const parent = event.target.value

                      const firstChild = students.find(
                        (student) => student.parent === parent,
                      )

                      setSelectedPaymentParent(parent)

                      setSelectedPaymentStudent(
                        firstChild?.id ?? students[0]?.id ?? "",
                      )
                    }}
                  >
                    {paymentParents.map((parent) => (
                      <option key={parent.email} value={parent.name}>
                        {parent.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Apprenant
                  <select
                    name="student"
                    required
                    value={selectedPaymentStudent}
                    onChange={(event) =>
                      setSelectedPaymentStudent(event.target.value)
                    }
                  >
                    {paymentStudentOptions.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} —{" "}
                        {student.className}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Montant (FCFA)
                  <input
                    name="amount"
                    type="number"
                    min="1"
                    max={
                      selectedPaymentStudentRecord
                        ? parseXofDisplayAmount(
                            selectedPaymentStudentRecord.remaining,
                          )
                        : undefined
                    }
                    required
                    defaultValue="100000"
                  />
                </label>
                <label>
                  Date
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().slice(0, 10)}
                  />
                </label>
                <label>
                  Mode de paiement
                  <select name="method">
                    <option>Espèces</option>
                    <option>Mobile Money</option>
                    <option>Virement</option>
                  </select>
                </label>
                <label>
                  Référence
                  <input
                    name="reference"
                    required
                    defaultValue={`PAY-2026-${String(payments.length + 126).padStart(5, "0")}`}
                  />
                </label>
                <label className="span-2">
                  Commentaire
                  <input name="comment" placeholder="Facultatif" />
                </label>
              </>
            ) : isParent ? (
              <>
                <label>
                  Nom
                  <input name="lastName" required placeholder="Nom" />
                </label>
                <label>
                  Prénom
                  <input name="firstName" required placeholder="Prénom" />
                </label>
                <label>
                  Téléphone
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder="+225 07 00 00 00 00"
                  />
                </label>
                <label>
                  E-mail
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="parent@example.com"
                  />
                </label>
              </>
            ) : isClass ? (
              <>
                <label>
                  Niveau
                  <select
                    name="level"
                    value={classLevel}
                    onChange={(event) => setClassLevel(event.target.value)}
                  >
                    {["Maternelle", "Primaire", "Secondaire"].map((level) => (
                      <option key={level}>{level}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Nom de la classe
                  <input
                    name="name"
                    value={className}
                    onChange={(event) => {
                      setClassName(event.target.value)
                      setClassError("")
                    }}
                    required
                    placeholder="Ex. CM2 B"
                  />
                </label>
                {classError && (
                  <p role="alert" className="form-error span-2">
                    {classError}
                  </p>
                )}
              </>
            ) : isPlan ? (
              <>
                <label>
                  Nom du plan
                  <input
                    name="name"
                    required
                    placeholder="Ex. Plan semestriel"
                    defaultValue={planToEdit?.name}
                  />
                </label>
                <label>
                  Montant annuel (FCFA)
                  <input
                    name="amount"
                    type="number"
                    min="1"
                    required
                    defaultValue={
                      planToEdit
                        ? parseXofDisplayAmount(planToEdit.amount)
                        : "450000"
                    }
                  />
                </label>
                <label>
                  Nombre de tranches
                  <input
                    name="installments"
                    type="number"
                    min="1"
                    max="12"
                    required
                    defaultValue={
                      planToEdit?.installments.match(/\d+/)?.[0] ?? "5"
                    }
                  />
                </label>
              </>
            ) : (
              <>
                <label>
                  Nom
                  <input name="lastName" required placeholder="Nom" />
                </label>
                <label>
                  Prénom
                  <input name="firstName" required placeholder="Prénom" />
                </label>
                <label>
                  Date de naissance
                  <input name="birthDate" type="date" />
                </label>
                <label>
                  Sexe
                  <select name="gender">
                    <option>Non renseigné</option>
                    <option>Fille</option>
                    <option>Garçon</option>
                  </select>
                </label>
                <label>
                  Classe
                  <select
                    name="className"
                    required
                    value={studentClass}
                    onChange={(event) => setStudentClass(event.target.value)}
                  >
                    {classes
                      .filter((item) => item.level === studentLevel)
                      .map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  Niveau
                  <select
                    name="level"
                    required
                    value={studentLevel}
                    onChange={(event) => {
                      const level = event.target.value

                      setStudentLevel(level)

                      setStudentClass(
                        classes.find((item) => item.level === level)?.name ??
                          "",
                      )
                    }}
                  >
                    {["Maternelle", "Primaire", "Secondaire"].map((level) => (
                      <option key={level}>{level}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Parent / Tuteur
                  <select name="parent" required>
                    {parents.map((parent) => (
                      <option key={parent.email}>{parent.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Montant total (FCFA)
                  <input
                    name="total"
                    type="number"
                    min="1"
                    required
                    defaultValue="450000"
                  />
                </label>
              </>
            )}
          </div>
          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}
          <div className="modal-actions">
            <Button variant="secondary" onClick={close}>
              Annuler
            </Button>
            <Button type="submit">
              {isPayment
                ? "Enregistrer le paiement"
                : isParent
                  ? "Ajouter le parent"
                  : isClass
                    ? "Créer la classe"
                    : isPlan
                      ? action === "plan-edit"
                        ? "Enregistrer les modifications"
                        : "Créer le plan"
                      : "Créer l’apprenant"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
