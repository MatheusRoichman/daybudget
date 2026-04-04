import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

interface BalanceTextProps {
  amount: number;
  className?: string;
  glow?: boolean;
}

export function BalanceText({ amount, className, glow = false }: BalanceTextProps) {
  return (
    <span
      className={cn(
        "font-mono font-medium tabular-nums tracking-tighter",
        amount > 0 && "text-secondary-fixed-dim",
        amount > 0 && glow && "drop-shadow-[0_0_15px_rgba(74,225,118,0.2)]",
        amount < 0 && "text-error",
        amount < 0 && glow && "drop-shadow-[0_0_15px_rgba(255,180,171,0.2)]",
        amount === 0 && "text-on-surface-variant",
        className
      )}
    >
      {formatCurrency(amount)}
    </span>
  );
}
