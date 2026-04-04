import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { Campaign } from "@/lib/db/schema";

interface CampaignSummaryCardProps {
  campaign: Campaign;
  availableBalance: number;
  dailyLimit: number;
  currentDay: number;
  totalDays: number;
}

export function CampaignSummaryCard({
  campaign,
  availableBalance,
  dailyLimit,
  currentDay,
  totalDays,
}: CampaignSummaryCardProps) {
  const isNegative = availableBalance < 0;
  const progress = Math.min(100, (currentDay / totalDays) * 100);

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <div
        className={`group bg-surface-container-high p-6 rounded-lg transition-all hover:bg-surface-container-highest ${
          isNegative ? "border border-error/20" : "border border-outline-variant/10"
        }`}
      >
        <div className="flex justify-between items-start mb-6">
          <h3 className="font-sora font-semibold text-lg text-on-surface">
            {campaign.name}
          </h3>
          <span className="font-mono text-[10px] text-on-surface-variant bg-surface-dim px-2 py-1 rounded">
            Dia {currentDay} de {totalDays}
          </span>
        </div>

        <div className="w-full h-1 bg-surface-dim rounded-full mb-8 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isNegative ? "bg-error" : "bg-primary-container"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-4">
          <div className="flex flex-col">
            <span className="font-sora text-[10px] uppercase tracking-wider text-on-surface-variant">
              Limite diário
            </span>
            <span className="font-mono text-on-surface">
              {formatCurrency(dailyLimit)}
            </span>
          </div>
          <div className="flex flex-col pt-4 border-t border-outline-variant/10">
            <span className="font-sora text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">
              Disponível hoje
            </span>
            <span
              className={`font-mono text-2xl ${
                isNegative ? "text-error" : "text-secondary-fixed-dim"
              }`}
            >
              {formatCurrency(availableBalance)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
