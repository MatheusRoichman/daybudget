import { notFound } from "next/navigation";
import { AddExpenseForm } from "@/components/campaigns/add-expense-form";
import { BalanceChart } from "@/components/campaigns/balance-chart";
import { FutureCampaignBanner } from "@/components/campaigns/balance-display";
import { CampaignHeader } from "@/components/campaigns/campaign-header";
import { CampaignStats } from "@/components/campaigns/campaign-stats";
import { ExpensesList } from "@/components/campaigns/expenses-list";
import {
	getAvailableBalance,
	getCampaignDays,
	getCampaignStatus,
	getDailyBreakdown,
	getDaysRemaining,
	getFinalBalance,
	getTotalSpent,
} from "@/lib/budget";
import { getToday } from "@/lib/get-today";
import { getCampaignWithExpenses } from "@/lib/queries";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: PageProps) {
	const { id } = await params;
	const campaignId = parseInt(id, 10);
	if (isNaN(campaignId)) notFound();

	const result = await getCampaignWithExpenses(campaignId);
	if (!result) notFound();

	const { expenses, ...campaign } = result;
	const today = await getToday();
	const status = getCampaignStatus(campaign, today);
	const totalDays = getCampaignDays(campaign);
	const expenseEntries = expenses.map((e) => ({
		amount: e.amount,
		date: e.date,
	}));

	const balance =
		status === "ended"
			? getFinalBalance(campaign, expenseEntries)
			: status === "active"
				? getAvailableBalance(campaign, expenseEntries, today)
				: 0;

	const breakdown = getDailyBreakdown(campaign, expenseEntries, today);

	return (
		<div>
			<CampaignHeader campaign={campaign} status={status} />

			{status === "future" ? (
				<FutureCampaignBanner startDate={campaign.startDate} />
			) : (
				<CampaignStats
					availableBalance={balance}
					totalBudget={campaign.amount}
					totalSpent={getTotalSpent(expenseEntries)}
					daysRemaining={
						status === "ended" ? 0 : getDaysRemaining(campaign, today)
					}
					totalDays={totalDays}
					status={status}
				/>
			)}

			{breakdown.length > 0 && <BalanceChart data={breakdown} />}

			{status !== "ended" && (
				<AddExpenseForm
					campaignId={campaign.id}
					startDate={campaign.startDate}
					endDate={campaign.endDate}
				/>
			)}

			<ExpensesList expenses={expenses} campaignId={campaign.id} />
		</div>
	);
}
