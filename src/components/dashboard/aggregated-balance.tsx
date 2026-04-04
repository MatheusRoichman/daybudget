import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface AggregatedBalanceProps {
  total: number;
}

export function AggregatedBalance({ total }: AggregatedBalanceProps) {
  const isPositive = total >= 0;

  return (
    <header className="py-12 flex flex-col items-start gap-2">
      <span className="font-sora text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-semibold">
        Disponível hoje
      </span>
      <div className="flex items-baseline gap-3">
        <span
          className={`font-mono text-5xl md:text-7xl font-medium ${
            isPositive
              ? "text-secondary-fixed-dim drop-shadow-[0_0_15px_rgba(74,225,118,0.2)]"
              : "text-error drop-shadow-[0_0_15px_rgba(255,180,171,0.2)]"
          }`}
        >
          {formatCurrency(total)}
        </span>
        {isPositive ? (
          <TrendingUp className="w-8 h-8 text-ds-secondary" />
        ) : (
          <TrendingDown className="w-8 h-8 text-error" />
        )}
      </div>
    </header>
  );
}
