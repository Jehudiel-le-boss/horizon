"use client"

import { useEffect, useState, type ReactNode } from "react"

import { usePathname, useRouter } from "next/navigation"

import { Bell, ChevronRight, LogOut, Menu, X } from "lucide-react"

import { Icon, Logo, type IconName } from "@/components/shared/ui"

import { PortalActionsContext, type PortalRole } from "./portal-context"
import {
  mockNotifications,
  mockClasses,
  mockParentNotifications,
  mockPaymentPlans,
  mockParents,
  mockPayments,
  mockStudents,
  type NotificationRecord,
  type ClassRecord,
  type PaymentPlanRecord,
  type ParentRecord,
  type PaymentRecord,
  type StudentRecord,
} from "@/lib/mock-data"
import { formatXofAmount, parseXofDisplayAmount } from "@/lib/domain/money"

import Modal from "./modal"

const parentNav = [
  ["dashboard", "home", "Tableau de bord"],

  ["children", "people", "Mes enfants"],

  ["fees", "wallet", "Frais scolaires"],

  ["schedule", "calendar", "Échéancier"],

  ["payments", "receipt", "Paiements"],

  ["notifications", "bell", "Notifications"],

  ["profile", "user", "Profil"],
] as const

const adminNav = [
  ["dashboard", "home", "Tableau de bord"],

  ["students", "people", "Apprenants"],

  ["parents", "user", "Parents"],

  ["classes", "school", "Classes"],

  ["fees", "wallet", "Frais scolaires"],

  ["schedule", "calendar", "Échéanciers"],

  ["payments", "money", "Paiements"],

  ["receipts", "receipt", "Reçus"],

  ["reports", "chart", "Rapports"],

  ["notifications", "bell", "Notifications"],

  ["settings", "settings", "Paramètres"],
] as const

type NavigationItem = readonly [string, IconName, string]
type PersistedPortalState = {
  students: StudentRecord[]
  selectedStudentId: string
  parents: ParentRecord[]
  payments: PaymentRecord[]
  notifications: NotificationRecord[]
  parentNotifications: NotificationRecord[]
  classes: ClassRecord[]
  paymentPlans: PaymentPlanRecord[]
}

const portalStateKey = "horizon-demo-state-v1"

export default function PortalShell({
  role,

  children,
}: {
  role: PortalRole

  children: ReactNode
}) {
  const pathname = usePathname()

  const router = useRouter()

  const [mobileOpen, setMobileOpen] = useState(false)

  const [modal, setModal] = useState<string | null>(null)
  const [students, setStudents] = useState<StudentRecord[]>(mockStudents)
  const [selectedStudentId, setSelectedStudentId] = useState("HZN-0261")
  const [parents, setParents] = useState<ParentRecord[]>(mockParents)
  const [payments, setPayments] = useState<PaymentRecord[]>(mockPayments)
  const [notifications, setNotifications] =
    useState<NotificationRecord[]>(mockNotifications)
  const [parentNotifications, setParentNotifications] =
    useState<NotificationRecord[]>(mockParentNotifications)
  const [classes, setClasses] = useState<ClassRecord[]>(mockClasses)
  const [paymentPlans, setPaymentPlans] =
    useState<PaymentPlanRecord[]>(mockPaymentPlans)
  const [stateLoaded, setStateLoaded] = useState(false)

  useEffect(() => {
    try {
      const serialized = window.sessionStorage.getItem(portalStateKey)
      if (serialized) {
        const restored: unknown = JSON.parse(serialized)
        if (
          restored !== null &&
          typeof restored === "object" &&
          "students" in restored &&
          Array.isArray(restored.students) &&
          "selectedStudentId" in restored &&
          typeof restored.selectedStudentId === "string" &&
          "parents" in restored &&
          Array.isArray(restored.parents) &&
          "payments" in restored &&
          Array.isArray(restored.payments) &&
          "notifications" in restored &&
          Array.isArray(restored.notifications) &&
          "parentNotifications" in restored &&
          Array.isArray(restored.parentNotifications) &&
          "classes" in restored &&
          Array.isArray(restored.classes) &&
          "paymentPlans" in restored &&
          Array.isArray(restored.paymentPlans)
        ) {
          const state = restored as PersistedPortalState
          setStudents(state.students)
          setSelectedStudentId(state.selectedStudentId)
          setParents(state.parents)
          setPayments(state.payments)
          setNotifications(state.notifications)
          setParentNotifications(state.parentNotifications)
          setClasses(state.classes)
          setPaymentPlans(state.paymentPlans)
        } else {
          window.sessionStorage.removeItem(portalStateKey)
        }
      }
    } catch (error) {
      console.error(
        "Impossible de restaurer les données de démonstration.",
        error,
      )
      window.sessionStorage.removeItem(portalStateKey)
    } finally {
      setStateLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!stateLoaded) return
    const state: PersistedPortalState = {
      students,
      selectedStudentId,
      parents,
      payments,
      notifications,
      parentNotifications,
      classes,
      paymentPlans,
    }
    try {
      window.sessionStorage.setItem(portalStateKey, JSON.stringify(state))
    } catch (error) {
      console.error(
        "Impossible de sauvegarder les données de démonstration.",
        error,
      )
    }
  }, [
    stateLoaded,
    students,
    selectedStudentId,
    parents,
    payments,
    notifications,
    parentNotifications,
    classes,
    paymentPlans,
  ])

  const nav: readonly NavigationItem[] =
    role === "parent" ? parentNav : adminNav

  const page = pathname.split("/")[2] || "dashboard"

  const title =
    nav.find(([key]) => key === page)?.[2] ||
    (role === "parent" && page === "child" ? "Situation de l’enfant" : "Détail")

  const workspace = role === "parent" ? "Espace famille" : "Administration"
  const unreadNotifications =
    role === "parent"
      ? parentNotifications.filter((notification) => !notification.read).length
      : notifications.filter((notification) => !notification.read).length

  function navigate(nextPage: string) {
    router.push(nextPage === "dashboard" ? `/${role}` : `/${role}/${nextPage}`)

    setMobileOpen(false)
  }

  function selectStudent(id: string) {
    setSelectedStudentId(id)
  }

  function createStudent(
    student: Omit<StudentRecord, "id" | "paid" | "remaining" | "status">,
  ) {
    setStudents((current) => [
      {
        ...student,
        id: `HZN-${String(262 + current.length - mockStudents.length).padStart(4, "0")}`,
        paid: "0",
        remaining: student.total,
        status: "À suivre",
      },
      ...current,
    ])
    const amount = parseXofDisplayAmount(student.total)
    setParents((current) =>
      current.map((parent) =>
        parent.name === student.parent
          ? {
              ...parent,
              children: String(Number.parseInt(parent.children, 10) + 1),
              due: formatXofAmount(parseXofDisplayAmount(parent.due) + amount),
            }
          : parent,
      ),
    )
  }

  function createParent(
    parent: Omit<ParentRecord, "children" | "due" | "paid" | "status">,
  ) {
    setParents((current) => [
      {
        ...parent,
        children: "0",
        due: "0",
        paid: "0",
        status: "Nouveau",
      },
      ...current,
    ])
  }

  function createClass(record: ClassRecord) {
    setClasses((current) =>
      current.some(
        (item) =>
          item.name.toLocaleLowerCase() === record.name.toLocaleLowerCase(),
      )
        ? current
        : [...current, record],
    )
  }

  function createPaymentPlan(record: PaymentPlanRecord) {
    setPaymentPlans((current) => [record, ...current])
  }

  function updatePaymentPlan(name: string, record: PaymentPlanRecord) {
    setPaymentPlans((current) =>
      current.map((plan) => (plan.name === name ? record : plan)),
    )
  }

  function removePaymentPlan(name: string) {
    setPaymentPlans((current) => current.filter((plan) => plan.name !== name))
  }

  function addPaymentInstallment(name: string) {
    setPaymentPlans((current) =>
      current.map((plan) => {
        if (plan.name !== name) return plan
        const count = Number.parseInt(plan.installments, 10)
        return { ...plan, installments: `${Math.min(count + 1, 12)} tranches` }
      }),
    )
  }

  function createPayment(payment: Omit<PaymentRecord, "status">) {
    setPayments((current) => [{ ...payment, status: "Payé" }, ...current])
    const amount = parseXofDisplayAmount(payment.amount)
    const student = students.find(
      (item) => `${item.firstName} ${item.lastName}` === payment.student,
    )
    setStudents((current) =>
      current.map((item) => {
        if (`${item.firstName} ${item.lastName}` !== payment.student)
          return item
        const paid = parseXofDisplayAmount(item.paid) + amount
        const total = parseXofDisplayAmount(item.total)
        const remaining = Math.max(total - paid, 0)
        return {
          ...item,
          paid: formatXofAmount(paid),
          remaining: formatXofAmount(remaining),
          status: remaining === 0 ? "Soldé" : "À jour",
        }
      }),
    )
    if (student) {
      setParents((current) =>
        current.map((parent) =>
          parent.name === student.parent
            ? {
                ...parent,
                paid: formatXofAmount(
                  parseXofDisplayAmount(parent.paid) + amount,
                ),
              }
            : parent,
        ),
      )
    }
    const now = new Date()
    const paymentNotification: NotificationRecord = {
      id: `payment-${payment.reference}`,
      title: "Paiement bien enregistré",
      message: `Le paiement de ${payment.amount} pour ${payment.student} a bien été enregistré (${payment.reference}).`,
      audience: student?.parent ?? "Famille Horizon",
      date: `Aujourd’hui, ${new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(now)}`,
      channel: "Plateforme",
      category: "payment",
      read: true,
    }
    setNotifications((current) => [paymentNotification, ...current])
    if (student?.parent === "Aminata Koffi") {
      setParentNotifications((current) => [
        { ...paymentNotification, read: false },
        ...current,
      ])
    }
  }

  function sendNotification(
    notification: Omit<NotificationRecord, "id" | "date" | "read">,
  ) {
    const now = new Date()
    const date = `Aujourd’hui, ${new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(now)}`
    const newNotification: NotificationRecord = {
      ...notification,
      id: `notification-${Date.now()}`,
      date,
      read: true,
    }
    setNotifications((current) => [newNotification, ...current])
    const familyStudents = students.filter(
      (student) => student.parent === "Aminata Koffi",
    )
    const target = notification.audience
    const reachesFamily =
      target === "Tous les parents" ||
      (target.startsWith("Classe ") &&
        familyStudents.some(
          (student) => student.className === target.slice(7),
        )) ||
      (target.startsWith("Niveau ") &&
        familyStudents.some((student) => student.level === target.slice(7)))
    if (reachesFamily) {
      setParentNotifications((current) => [
        { ...newNotification, read: false },
        ...current,
      ])
    }
  }

  function markAllNotificationsRead() {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    )
    setParentNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    )
  }

  function markNotificationRead(id: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    )
    setParentNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    )
  }

  return (
    <PortalActionsContext.Provider
      value={{
        navigate,
        setModal,
        students,
        selectedStudentId,
        parents,
        payments,
        notifications,
        parentNotifications,
        classes,
        paymentPlans,
        createStudent,
        createParent,
        createClass,
        createPaymentPlan,
        updatePaymentPlan,
        removePaymentPlan,
        addPaymentInstallment,
        selectStudent,
        createPayment,
        sendNotification,
        markAllNotificationsRead,
        markNotificationRead,
      }}
    >
      <div className={`portal ${role}`}>
        <aside className={mobileOpen ? "open" : ""}>
          <div className="sidebar-head">
            <Logo />
            <button
              className="close-menu"
              onClick={() => setMobileOpen(false)}
              aria-label="Fermer le menu"
            >
              <X className="icon" />
            </button>
          </div>
          <span className="workspace-label">{workspace}</span>
          <nav>
            {nav.map(([key, icon, label]) => (
              <button
                key={key}
                className={page === key ? "active" : ""}
                onClick={() => navigate(key)}
                aria-current={page === key ? "page" : undefined}
              >
                <Icon name={icon} />
                <span>{label}</span>
                {key === "notifications" && unreadNotifications > 0 && (
                  <i>{unreadNotifications}</i>
                )}
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="school-chip">
              <span>
                <Icon name="school" />
              </span>
              <div>
                <b>Complexe Scolaire</b>
                <small>Horizon • 2026-2027</small>
              </div>
            </div>
            <button onClick={() => router.push("/login")}>
              <LogOut className="icon" />
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>
        {mobileOpen && (
          <div className="scrim" onClick={() => setMobileOpen(false)} />
        )}
        <div className="portal-main">
          <header className="app-header">
            <button
              className="menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu className="icon" />
            </button>
            <div>
              <small>{workspace}</small>
              <h1>{title}</h1>
            </div>
            <div className="header-actions">
              <button
                className="notification-button"
                aria-label="Notifications"
                onClick={() => navigate("notifications")}
              >
                <Bell className="icon" />
                {unreadNotifications > 0 && <i />}
              </button>
              <div className="profile-chip">
                <span>{role === "parent" ? "AK" : "YM"}</span>
                <div>
                  <b>{role === "parent" ? "Aminata Koffi" : "Yao Mensah"}</b>
                  <small>
                    {role === "parent" ? "Parent / Tuteur" : "Administrateur"}
                  </small>
                </div>
                <ChevronRight className="icon" size={16} />
              </div>
            </div>
          </header>
          <main key={pathname} className="app-content">
            {children}
          </main>
        </div>
        {modal && <Modal type={modal} close={() => setModal(null)} />}
      </div>
    </PortalActionsContext.Provider>
  )
}
