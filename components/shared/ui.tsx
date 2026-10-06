"use client"

import { useState, type ReactNode } from "react"
import {
  ArrowRight,
  Banknote,
  Bell,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Check,
  ChevronRight,
  Clock3,
  Download,
  Ellipsis,
  Eye,
  FileText,
  Filter,
  House,
  Info,
  LogOut,
  Menu,
  Plus,
  Receipt,
  School,
  Search,
  Settings as SettingsGlyph,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react"
import { mockPayments, type PaymentRecord } from "@/lib/mock-data"
export type IconName = "arrow" | "bell" | "calendar" | "chart" | "check" | "chevron" | "clock" | "download" | "eye" | "file" | "filter" | "home" | "info" | "logout" | "menu" | "money" | "more" | "people" | "plus" | "receipt" | "school" | "search" | "settings" | "shield" | "spark" | "user" | "wallet" | "x"

const icons: Record<IconName, LucideIcon> = {
  arrow: ArrowRight,
  bell: Bell,
  calendar: CalendarDays,
  chart: ChartNoAxesColumnIncreasing,
  check: Check,
  chevron: ChevronRight,
  clock: Clock3,
  download: Download,
  eye: Eye,
  file: FileText,
  filter: Filter,
  home: House,
  info: Info,
  logout: LogOut,
  menu: Menu,
  money: Banknote,
  more: Ellipsis,
  people: UsersRound,
  plus: Plus,
  receipt: Receipt,
  school: School,
  search: Search,
  settings: SettingsGlyph,
  shield: ShieldCheck,
  spark: Sparkles,
  user: UserRound,
  wallet: Wallet,
  x: X,
}

export function Icon({
  name,
  size = 20,
}: {
  name: IconName
  size?: number
}) {
  const LucideIcon = icons[name]
  return <LucideIcon className="icon" size={size} aria-hidden="true" />
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo">
      <span className="logo-mark">
        <Icon name="school" size={22} />
      </span>
      {!compact && (
        <span>
          <b>Horizon</b>
          <small>Suivi scolaire</small>
        </span>
      )}
    </div>
  )
}

export function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  type = "button",
  disabled = false,
}: {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost" | "danger"
  icon?: IconName
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
    </button>
  )
}

export function Badge({
  children,
  tone = "success",
}: {
  children: ReactNode
  tone?: "success" | "warning" | "danger" | "info" | "neutral"
}) {
  return (
    <span className={`badge badge-${tone}`}>
      <span className="badge-dot" />
      {children}
    </span>
  )
}

export function Amount({ children }: { children: ReactNode }) {
  return <span className="amount">{children}</span>
}

export function PageIntro({
  eyebrow,
  title,
  text,
  actions,
}: {
  eyebrow?: string
  title: string
  text: string
  actions?: ReactNode
}) {
  return (
    <div className="page-intro">
      <div>
        {eyebrow && <span>{eyebrow}</span>}
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}

export const payments = mockPayments

export function StatCard({
  icon,
  label,
  value,
  note,
  tone = "blue",
}: {
  icon: IconName
  label: string
  value: string
  note?: string
  tone?: string
}) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-top">
        <span>
          <Icon name={icon} />
        </span>
        <small>{label}</small>
      </div>
      <Amount>{value}</Amount>
      {note && <p>{note}</p>}
    </article>
  )
}

export function PaymentTable({
  compact = false,
  onReceipt,
  rows = payments,
}: {
  compact?: boolean
  onReceipt?: (payment: PaymentRecord) => void
  rows?: PaymentRecord[]
}) {
  const data = compact ? rows.slice(0, 3) : rows
  return (
    <div className="responsive-table">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            {!compact && <th>Enfant</th>}
            <th>Référence</th>
            <th>Montant</th>
            <th>Mode</th>
            <th>Statut</th>
            {!compact && <th />}
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.reference}>
              <td>{r.date}</td>
              {!compact && (
                <td>
                  <span className="person-cell">
                    <i>
                      {r.student
                        .split(" ")
                        .map((s) => s[0])
                        .join("")}
                    </i>
                    <b>{r.student}</b>
                  </span>
                </td>
              )}
              <td>
                <code>{r.reference}</code>
              </td>
              <td>
                <b>{r.amount}</b>
              </td>
              <td>{r.method}</td>
              <td>
                <Badge>{r.status}</Badge>
              </td>
              {!compact && (
                <td>
                  <button
                    className="table-action"
                    onClick={() => onReceipt?.(r)}
                  >
                    <Icon name="eye" size={17} /> Voir le reçu
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function BarChart() {
  const data = [
    [52, 36],
    [61, 41],
    [72, 53],
    [84, 67],
    [76, 59],
    [91, 73],
  ]
  return (
    <div className="chart">
      <div className="y-axis">
        <span>100 M</span>
        <span>75 M</span>
        <span>50 M</span>
        <span>25 M</span>
        <span>0</span>
      </div>
      <div className="bars">
        {data.map(([a, b], i) => (
          <div className="bar-group" key={i}>
            <div>
              <i style={{ height: `${a}%` }} />
              <b style={{ height: `${b}%` }} />
            </div>
            <span>{["Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov."][i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TableToolbar({
  placeholder = "Rechercher...",
  onSearch,
  levels,
  statuses = ["Payé", "En retard", "À jour", "À suivre", "Soldé"],
  onLevelChange,
  onStatusChange,
  onExport,
}: {
  placeholder?: string
  onSearch?: (value: string) => void
  levels?: string[]
  statuses?: string[]
  onLevelChange?: (value: string) => void
  onStatusChange?: (value: string) => void
  onExport?: () => void
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  function exportTable() {
    if (onExport) {
      onExport()
      return
    }
    const table = document.querySelector(".data-card .responsive-table table")
    if (!table) return
    const content = Array.from(table.querySelectorAll("tr"))
      .map((row) =>
        Array.from(row.querySelectorAll("th, td"))
          .map(
            (cell) =>
              `"${(cell.textContent ?? "").trim().replaceAll('"', '""')}"`,
          )
          .join(";"),
      )
      .join("\r\n")
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" }),
    )
    const link = document.createElement("a")
    link.href = url
    link.download = "export-horizon.csv"
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="filters">
      <div>
        <Icon name="search" size={18} />
        <input
          placeholder={placeholder}
          onChange={(event) => onSearch?.(event.target.value)}
        />
      </div>
      {levels && (
        <select
          aria-label="Filtrer par niveau"
          onChange={(event) => onLevelChange?.(event.target.value)}
        >
          <option value="">Tous les niveaux</option>
          {levels.map((level) => (
            <option key={level}>{level}</option>
          ))}
        </select>
      )}
      {showAdvanced && (
        <select
          aria-label="Filtrer par statut"
          onChange={(event) => onStatusChange?.(event.target.value)}
        >
          <option value="">Tous les statuts</option>
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      )}
      <Button
        variant="ghost"
        icon="filter"
        onClick={() => setShowAdvanced((current) => !current)}
      >
        {showAdvanced ? "Masquer les filtres" : "Plus de filtres"}
      </Button>
      <Button variant="secondary" icon="download" onClick={exportTable}>
        Exporter
      </Button>
    </div>
  )
}
