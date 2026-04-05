export const dynamic = "force-dynamic";

import Link from "next/link";
import { CampaignSummaryCard } from "@/components/campaigns/campaign-summary-card";
import { AggregatedBalance } from "@/components/dashboard/aggregated-balance";
import { NegativeBalanceAlert } from "@/components/dashboard/negative-balance-alert";
import {
	getAvailableBalance,
	getCampaignDays,
	getCurrentDay,
	getDailyLimit,
} from "@/lib/budget";
import { getToday } from "@/lib/get-today";
import { getActiveCampaigns } from "@/lib/queries";

export default async function DashboardPage() {
	const today = await getToday();
	const activeCampaigns = await getActiveCampaigns(today);

	const campaignsWithBalance = activeCampaigns.map((c) => {
		const { expenses, ...campaign } = c;
		const expenseEntries = expenses.map((e) => ({
			amount: e.amount,
			date: e.date,
		}));
		const balance = getAvailableBalance(campaign, expenseEntries, today);
		return { campaign, balance, expenses };
	});

	const aggregatedBalance = campaignsWithBalance.reduce(
		(sum, c) => sum + c.balance,
		0,
	);

	const negativeCampaigns = campaignsWithBalance
		.filter((c) => c.balance < 0)
		.map((c) => c.campaign.name);

	return (
		<div>
			{activeCampaigns.length === 0 ? (
				<div className="py-24 flex flex-col items-center gap-6">
					<p className="text-on-surface-variant font-sora">
						Nenhuma campanha ativa no momento.
					</p>
					<Link
						href="/campaigns/new"
						className="bg-ds-primary text-on-primary px-6 py-3 rounded-lg font-sora font-semibold hover:bg-ds-primary/90 transition-colors"
					>
						Criar Campanha
					</Link>
				</div>
			) : (
				<>
					<AggregatedBalance total={aggregatedBalance} />
					<NegativeBalanceAlert campaignNames={negativeCampaigns} />

					<div className="flex justify-between items-end mb-8">
						<h2 className="font-sora text-2xl font-bold tracking-tight text-on-surface">
							Campanhas Ativas
						</h2>
						<Link
							href="/campaigns"
							className="text-ds-primary text-sm font-semibold hover:underline decoration-2 underline-offset-4"
						>
							Ver Todas
						</Link>
					</div>

					<section className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{campaignsWithBalance.map(({ campaign, balance }) => (
							<CampaignSummaryCard
								key={campaign.id}
								campaign={campaign}
								availableBalance={balance}
								dailyLimit={getDailyLimit(campaign)}
								currentDay={getCurrentDay(campaign, today)}
								totalDays={getCampaignDays(campaign)}
							/>
						))}
					</section>
				</>
			)}
		</div>
	);
}
