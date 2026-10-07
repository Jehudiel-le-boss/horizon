"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { MonthlyPaymentSummary } from "@/lib/domain/financial-summary"

import { formatXofAmount } from "@/lib/domain/money"

export function FinanceChart({
  data,

  height = 280,
}: {
  data: MonthlyPaymentSummary[]

  height?: number
}) {
  const total = data.reduce((sum, month) => sum + month.amount, 0)

  const label = `Histogramme des encaissements mensuels sur ${data.length} mois. Total affiché : ${formatXofAmount(total)} francs CFA.`

  return (
    <div
      role="img"
      aria-label={label}
      style={{ width: "100%", height }}
      data-testid="finance-chart"
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart
          data={data}
          margin={{ top: 12, right: 12, left: 4, bottom: 0 }}
          barCategoryGap="32%"
        >
          <defs>
            <linearGradient id="finance-collected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3978e8" stopOpacity={1} />
              <stop offset="100%" stopColor="#6ba7ff" stopOpacity={0.72} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--border, #e8edf4)"
            strokeDasharray="4 5"
          />
          <XAxis
            dataKey="period"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#7b8798", fontSize: 12 }}
            tickMargin={12}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={58}
            tick={{ fill: "#7b8798", fontSize: 11 }}
            tickFormatter={(value: number) =>
              value >= 1_000_000
                ? `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value / 1_000_000)} M`
                : value >= 1_000
                  ? `${Math.round(value / 1_000)} k`
                  : String(value)
            }
          />
          <Tooltip
            cursor={{ fill: "rgba(57, 120, 232, 0.06)" }}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.month ?? ""}
            formatter={(value) => [
              `${formatXofAmount(Number(value ?? 0))} FCFA`,

              "Encaissé",
            ]}
            contentStyle={{
              borderRadius: 12,

              border: "1px solid #e8edf4",

              boxShadow: "0 12px 32px rgba(26, 43, 70, 0.12)",

              fontSize: 13,
            }}
          />
          <Bar
            dataKey="amount"
            name="Encaissé"
            fill="url(#finance-collected)"
            radius={[7, 7, 2, 2]}
            maxBarSize={46}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
