import type { CampaignStatus } from "@/lib/budget";
import { formatCurrency } from "@/lib/format";

interface CampaignStatsProps {
	availableBalance: number;
	totalBudget: number;
	totalSpent: number;
	daysRemaining: number;
	totalDays: number;
	status: CampaignStatus;
}

export function CampaignStats({
	availableBalance,
	totalBudget,
	totalSpent,
	daysRemaining,
	totalDays,
	status,
}: CampaignStatsProps) {
	const isNegative = availableBalance < 0;
	const dayProgress =
		totalDays > 0 ? ((totalDays - daysRemaining) / totalDays) * 100 : 100;

	return (
		<section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
			{/* Available Today */}
			<div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/15 flex flex-col justify-between min-h-[160px] relative overflow-hidden">
				<div className="absolute top-0 right-0 w-24 h-24 bg-ds-secondary/5 blur-[40px] rounded-full -mr-12 -mt-12" />
				<p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold font-sora">
					{status === "ended" ? "Resultado final" : "Disponível hoje"}
				</p>
				<div>
					<p
						className={`text-4xl font-mono font-medium tracking-tighter ${
							isNegative
								? "text-error drop-shadow-[0_0_15px_rgba(255,180,171,0.2)]"
								: "text-ds-secondary drop-shadow-[0_0_15px_rgba(74,225,118,0.2)]"
						}`}
					>
						{formatCurrency(availableBalance)}
					</p>
				</div>
			</div>

			{/* Total Spent */}
			<div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/15 flex flex-col justify-between min-h-[160px]">
				<p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold font-sora">
					Total gasto
				</p>
				<div>
					<p className="text-4xl font-mono font-medium text-on-surface tracking-tighter">
						{formatCurrency(totalSpent)}
					</p>
					<p className="text-[10px] text-on-surface-variant font-mono mt-1 uppercase">
						de {formatCurrency(totalBudget)} orçamento
					</p>
				</div>
			</div>

			{/* Days Remaining */}
			<div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/15 flex flex-col justify-between min-h-[160px]">
				<p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold font-sora">
					Dias restantes
				</p>
				<div>
					<div className="flex items-baseline gap-2">
						<p className="text-4xl font-mono font-medium text-ds-primary tracking-tighter">
							{daysRemaining}
						</p>
						<p className="text-sm font-mono text-on-surface-variant uppercase">
							dias
						</p>
					</div>
					<div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden mt-2">
						<div
							className="bg-ds-primary h-full transition-all"
							style={{ width: `${Math.min(100, dayProgress)}%` }}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
