import Link from "next/link";
import type { CampaignStatus } from "@/lib/budget";
import type { Campaign } from "@/lib/db/schema";
import { formatCurrency, formatDate } from "@/lib/format";

interface CampaignListItemProps {
	campaign: Campaign;
	status: CampaignStatus;
	availableBalance?: number;
	dailyLimit: number;
	totalDays: number;
	currentDay?: number;
	totalSpent?: number;
	daysUntilStart?: number;
	percentUsed?: number;
	elapsedDays?: number;
}

export function CampaignListItem({
	campaign,
	status,
	availableBalance,
	dailyLimit,
	totalDays,
	totalSpent = 0,
	daysUntilStart,
	percentUsed = 0,
	elapsedDays = 0,
}: CampaignListItemProps) {
	const isNegative = (availableBalance ?? 0) < 0;

	return (
		<Link href={`/campaigns/${campaign.id}`}>
			<div className="glass-surface p-6 rounded-lg border border-outline-variant/15 flex flex-col gap-6 relative overflow-hidden hover:bg-surface-container-high/50 transition-all">
				{/* Header row */}
				<div className="flex justify-between items-start">
					<div>
						<h2 className="font-sora font-bold text-xl text-on-surface mb-1">
							{campaign.name}
						</h2>
						<span className="font-mono text-xs text-on-surface-variant uppercase">
							{formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}
						</span>
					</div>
					<div className="flex flex-col items-end">
						{status === "future" && daysUntilStart !== undefined ? (
							<>
								<span className="font-mono text-lg text-ds-primary font-medium">
									{daysUntilStart} dia{daysUntilStart !== 1 ? "s" : ""}
								</span>
								<span className="font-sora text-[10px] uppercase tracking-tighter text-on-surface-variant">
									Para iniciar
								</span>
							</>
						) : availableBalance !== undefined ? (
							<>
								<span
									className={`font-mono text-lg font-medium ${
										isNegative ? "text-error" : "text-ds-secondary"
									}`}
								>
									{formatCurrency(availableBalance)}
								</span>
								<span className="font-sora text-[10px] uppercase tracking-tighter text-on-surface-variant">
									{isNegative ? "Acima do orçamento" : "Disponível hoje"}
								</span>
							</>
						) : null}
					</div>
				</div>

				{/* Progress bar */}
				{status !== "future" && (
					<div className="w-full space-y-2">
						<div className="flex justify-between font-mono text-[10px] uppercase text-on-surface-variant">
							<span>
								{status === "ended"
									? `${totalDays} dias`
									: `Decorridos: ${elapsedDays} dias`}
							</span>
							<span>{Math.round(percentUsed)}% do orçamento usado</span>
						</div>
						<div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
							<div
								className="h-full bg-ds-primary transition-all"
								style={{ width: `${Math.min(100, percentUsed)}%` }}
							/>
						</div>
					</div>
				)}

				{/* 3-column stat row */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-outline-variant/10">
					<div className="border-l-2 border-ds-secondary pl-4 py-1">
						<p className="font-sora text-[10px] uppercase text-on-surface-variant tracking-widest">
							Limite diário
						</p>
						<p className="font-mono text-lg text-on-surface">
							{formatCurrency(dailyLimit)}
						</p>
					</div>
					<div className="border-l-2 border-ds-secondary/30 pl-4 py-1">
						<p className="font-sora text-[10px] uppercase text-on-surface-variant tracking-widest">
							Total gasto
						</p>
						<p className="font-mono text-lg text-on-surface">
							{formatCurrency(totalSpent)}
						</p>
					</div>
					<div
						className={`border-l-2 pl-4 py-1 ${
							isNegative ? "border-error" : "border-ds-secondary"
						}`}
					>
						<p className="font-sora text-[10px] uppercase text-on-surface-variant tracking-widest">
							{status === "future" ? "Orçamento total" : "Disponível hoje"}
						</p>
						<p
							className={`font-mono text-lg font-bold ${
								status === "future"
									? "text-on-surface"
									: isNegative
										? "text-error"
										: "text-ds-secondary"
							}`}
						>
							{status === "future"
								? formatCurrency(campaign.amount)
								: formatCurrency(availableBalance ?? 0)}
						</p>
					</div>
				</div>
			</div>
		</Link>
	);
}
