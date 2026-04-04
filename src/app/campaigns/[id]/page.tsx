import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getCampaignWithExpenses } from "@/lib/queries";
import {
  getCampaignStatus,
  getDailyLimit,
  getCampaignDays,
  getAvailableBalance,
  getFinalBalance,
  getDailyBreakdown,
  getDaysRemaining,
  getTotalSpent,
} from "@/lib/budget";
import { CampaignHeader } from "@/components/campaigns/campaign-header";
import { FutureCampaignBanner } from "@/components/campaigns/balance-display";
import { CampaignStats } from "@/components/campaigns/campaign-stats";
import { BalanceChart } from "@/components/campaigns/balance-chart";
import { AddExpenseForm } from "@/components/campaigns/add-expense-form";
import { ExpensesList } from "@/components/campaigns/expenses-list";

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
  const today = format(new Date(), "yyyy-MM-dd");
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
