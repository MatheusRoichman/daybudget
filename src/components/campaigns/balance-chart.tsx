"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatDateShort } from "@/lib/format";
import type { DailyBreakdown } from "@/lib/budget";

interface BalanceChartProps {
  data: DailyBreakdown[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-container-high border border-outline-variant/15 p-3 rounded-lg font-mono text-sm">
      <p className="text-on-surface-variant text-xs mb-1">
        {formatDateShort(label)}
      </p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function BalanceChart({ data }: BalanceChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant text-center py-6 font-sora">
        Sem dados para exibir.
      </p>
    );
  }

  return (
    <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/15 mb-10">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-sm font-bold tracking-tight uppercase mb-1 font-sora">
            Trajetória do Orçamento
          </h3>
          <p className="text-xs text-on-surface-variant font-sora">
            Projeção do saldo diário disponível
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ds-secondary" />
            <span className="text-[10px] uppercase font-mono text-on-surface-variant">
              Saldo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full border border-dashed border-ds-primary" />
            <span className="text-[10px] uppercase font-mono text-on-surface-variant">
              Orçamento
            </span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ae176" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#4ae176" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(v) => formatDateShort(v)}
            tick={{ fontSize: 10, fill: "#c2c6d6", fontFamily: "var(--font-dm-mono)" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) =>
              new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(v)
            }
            tick={{ fontSize: 10, fill: "#c2c6d6", fontFamily: "var(--font-dm-mono)" }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={0}
            stroke="#424754"
            strokeDasharray="2 2"
            strokeWidth={1}
          />
          <Line
            type="monotone"
            dataKey="cumulativeBudget"
            name="Orçamento"
            stroke="#adc6ff"
            strokeDasharray="4 4"
            dot={false}
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="balance"
            name="Saldo"
            stroke="#4ae176"
            fill="url(#balanceGradient)"
            strokeWidth={2.5}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
