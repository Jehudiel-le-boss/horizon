"use client"

import { createContext, useContext } from "react"
import type {
  ClassRecord,
  NotificationRecord,
  PaymentPlanRecord,
  PaymentRecord,
  ParentRecord,
  StudentRecord,
} from "@/lib/mock-data"

export type PortalRole = "parent" | "admin"

export type PortalActions = {
  navigate: (page: string) => void
  setModal: (modal: string | null) => void
  students: StudentRecord[]
  selectedStudentId: string
  parents: ParentRecord[]
  payments: PaymentRecord[]
  notifications: NotificationRecord[]
  parentNotifications: NotificationRecord[]
  classes: ClassRecord[]
  paymentPlans: PaymentPlanRecord[]
  createStudent: (
    student: Omit<StudentRecord, "id" | "paid" | "remaining" | "status">,
  ) => void
  createParent: (
    parent: Omit<ParentRecord, "children" | "due" | "paid" | "status">,
  ) => void
  createClass: (record: ClassRecord) => void
  createPaymentPlan: (record: PaymentPlanRecord) => void
  updatePaymentPlan: (name: string, record: PaymentPlanRecord) => void
  removePaymentPlan: (name: string) => void
  addPaymentInstallment: (name: string) => void
  selectStudent: (id: string) => void
  createPayment: (payment: Omit<PaymentRecord, "status">) => void
  sendNotification: (
    notification: Omit<NotificationRecord, "id" | "date" | "read">,
  ) => void
  markAllNotificationsRead: () => void
  markNotificationRead: (id: string) => void
}

export const PortalActionsContext = createContext<PortalActions | null>(null)

export function usePortalActions() {
  const actions = useContext(PortalActionsContext)

  if (!actions) {
    throw new Error("usePortalActions must be used inside PortalShell.")
  }

  return actions
}
