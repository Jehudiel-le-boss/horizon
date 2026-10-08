"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

import { usePathname, useRouter } from "next/navigation"

import { Bell, ChevronRight, LogOut, Menu, Moon, Sun, X } from "lucide-react"

import { clearDemoAccess } from "@/app/login/actions"
import { Icon, Logo, type IconName } from "@/components/shared/ui"
import { CustomScrollbar } from "@/components/shared/custom-scrollbar"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"
import { getSupabasePublicConfig } from "@/lib/supabase/config"

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

  paymentPlans: PersistedPaymentPlanRecord[]
}

type PersistedPaymentPlanRecord = Omit<PaymentPlanRecord, "classNames" | "dueDates"> & Partial<Pick<PaymentPlanRecord, "classNames" | "dueDates">>

const portalStateKey = "horizon-demo-state-v1"

const portalThemeKey = "horizon-portal-theme"

function getDefaultPaymentPlanDueDate(index: number) {
  return new Date(Date.UTC(2026, 8 + index, 15)).toISOString().slice(0, 10)
}

function normalizePaymentPlan(
  plan: PersistedPaymentPlanRecord,
): PaymentPlanRecord {
  const mockPlan = mockPaymentPlans.find(
    (mockPlan) => mockPlan.name === plan.name,
  )

  const parsedCount = Number.parseInt(
    plan.installments.match(/\d+/)?.[0] ?? "1",

    10,
  )

  const installmentCount = Math.min(
    Math.max(Number.isInteger(parsedCount) ? parsedCount : 1, 1),

    12,
  )

  const savedDueDates = Array.isArray(plan.dueDates) ? plan.dueDates : []

  return {
    ...plan,

    classNames: Array.isArray(plan.classNames)
      ? plan.classNames
      : (mockPlan?.classNames ?? []),

    dueDates: Array.from(
      { length: installmentCount },

      (_, index) =>
        savedDueDates[index] ??
        mockPlan?.dueDates[index] ??
        getDefaultPaymentPlanDueDate(index),
    ),
  }
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (
    update: () => void | Promise<void>,
  ) => { finished: Promise<void> }
}

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

  const [darkMode, setDarkMode] = useState(false)

  const [modal, setModal] = useState<string | null>(null)

  const [modalClosing, setModalClosing] = useState(false)

  const modalCloseTimer = useRef<number | null>(null)

  const pendingNavigation = useRef<{
    pathname: string

    resolve: () => void
  } | null>(null)

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

  const [logoutError, setLogoutError] = useState("")

  async function handleLogout() {
    setLogoutError("")

    try {
      if (getSupabasePublicConfig()) {
        const { error } = await createSupabaseBrowserClient().auth.signOut()
        if (error) throw error
      }

      await clearDemoAccess()
      router.push("/login")
    } catch (error) {
      console.error("Impossible de fermer la session.", error)
      setLogoutError("La déconnexion a échoué. Réessayez.")
    }
  }

  useEffect(() => {
    try {
      setDarkMode(window.localStorage.getItem(portalThemeKey) === "dark")
    } catch (error) {
      console.error("Impossible de restaurer le thème du portail.", error)
    }
  }, [])

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

          setPaymentPlans(state.paymentPlans.map(normalizePaymentPlan))
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

  useEffect(() => {
    if (pendingNavigation.current?.pathname !== pathname) return

    pendingNavigation.current.resolve()

    pendingNavigation.current = null
  }, [pathname])

  useEffect(
    () => () => {
      if (modalCloseTimer.current !== null) {
        window.clearTimeout(modalCloseTimer.current)
      }

      pendingNavigation.current?.resolve()
    },

    [],
  )

  function navigate(nextPage: string) {
    const target =
      nextPage === "dashboard" ? `/${role}` : `/${role}/${nextPage}`

    if (target !== pathname) {
      const transitionDocument = document as ViewTransitionDocument

      if (transitionDocument.startViewTransition) {
        pendingNavigation.current?.resolve()

        const transition = transitionDocument.startViewTransition.call(
          transitionDocument,

          () =>
            new Promise<void>((resolve) => {
              pendingNavigation.current = { pathname: target, resolve }

              router.push(target)
            }),
        )

        void transition.finished.catch((error: unknown) => {
          console.error("La transition de navigation a échoué.", error)
        })
      } else {
        router.push(target)
      }
    }

    setMobileOpen(false)
  }

  function toggleTheme() {
    const nextDarkMode = !darkMode

    setDarkMode(nextDarkMode)

    try {
      window.localStorage.setItem(
        portalThemeKey,
        nextDarkMode ? "dark" : "light",
      )
    } catch (error) {
      console.error("Impossible d’enregistrer le thème du portail.", error)
    }
  }

  function closeModal() {
    if (modalCloseTimer.current !== null) return

    setModalClosing(true)

    const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : 180

    modalCloseTimer.current = window.setTimeout(() => {
      setModal(null)

      setModalClosing(false)

      modalCloseTimer.current = null
    }, duration)
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

        const nextCount = Math.min(count + 1, 12)

        return {
          ...plan,

          installments: `${nextCount} tranches`,

          dueDates: Array.from(
            { length: nextCount },

            (_, index) =>
              plan.dueDates[index] ?? getDefaultPaymentPlanDueDate(index),
          ),
        }
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
      <div className={`portal ${role}${darkMode ? " theme-dark" : ""}`}>
        <CustomScrollbar
          as="aside"
          id="portal-navigation"
          className={mobileOpen ? "open" : ""}
          aria-label="Navigation principale"
        >
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
            <button onClick={() => void handleLogout()}>
              <LogOut className="icon" />
              <span>Déconnexion</span>
            </button>
            {logoutError && (
              <p className="auth-feedback error" role="alert">
                {logoutError}
              </p>
            )}
          </div>
        </CustomScrollbar>
        {mobileOpen && (
          <div className="scrim" onClick={() => setMobileOpen(false)} />
        )}
        <div className="portal-main">
          <header className="app-header">
            <button
              className="menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={mobileOpen}
              aria-controls="portal-navigation"
            >
              <Menu className="icon" />
            </button>
            <div>
              <small>{workspace}</small>
              <h1>{title}</h1>
            </div>
            <div className="header-actions">
              <button
                className="theme-toggle"
                type="button"
                aria-label={
                  darkMode ? "Activer le mode clair" : "Activer le mode sombre"
                }
                aria-pressed={darkMode}
                title={darkMode ? "Mode clair" : "Mode sombre"}
                onClick={toggleTheme}
              >
                {darkMode ? (
                  <Sun key="sun" className="icon" />
                ) : (
                  <Moon key="moon" className="icon" />
                )}
              </button>
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
        {modal && (
          <Modal type={modal} close={closeModal} isClosing={modalClosing} />
        )}
      </div>
    </PortalActionsContext.Provider>
  )
}
