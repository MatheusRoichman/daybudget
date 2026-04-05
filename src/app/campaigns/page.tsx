export const dynamic = "force-dynamic";

import { differenceInCalendarDays, parseISO } from "date-fns";
import { Plus } from "lucide-react";
import Link from "next/link";
import { CampaignListItem } from "@/components/campaigns/campaign-list-item";
import { CampaignTabs } from "@/components/campaigns/campaign-tabs";
import {
	type CampaignStatus,
	getAvailableBalance,
	getCampaignDays,
	getCampaignStatus,
	getCurrentDay,
	getDailyLimit,
	getFinalBalance,
	getTotalSpent,
} from "@/lib/budget";
import type { Campaign, Expense } from "@/lib/db/schema";
import { getToday } from "@/lib/get-today";
import { getAllCampaigns } from "@/lib/queries";

type CampaignWithExpenses = Campaign & { expenses: Expense[] };

export default async function CampaignsPage() {
	const campaigns = await getAllCampaigns();
	const today = await getToday();

	const grouped: Record<CampaignStatus, CampaignWithExpenses[]> = {
		active: [],
		future: [],
		ended: [],
	};

	for (const c of campaigns) {
		const status = getCampaignStatus(c, today);
		grouped[status].push(c);
	}

	function getExpenseEntries(expenses: Expense[]) {
		return expenses.map((e) => ({ amount: e.amount, date: e.date }));
	}

	function renderCampaigns(
		list: CampaignWithExpenses[],
		status: CampaignStatus,
	) {
		if (list.length === 0) {
			return (
				<p className="text-on-surface-variant text-sm py-12 text-center font-sora">
					Nenhuma campanha{" "}
					{status === "active"
						? "ativa"
						: status === "future"
							? "futura"
							: "encerrada"}
					.
				</p>
			);
		}

		return (
			<div className="flex flex-col gap-6">
				{list.map((c) => {
					const entries = getExpenseEntries(c.expenses);
					const spent = getTotalSpent(entries);
					const days = getCampaignDays(c);
					const elapsed =
						status === "active"
							? getCurrentDay(c, today)
							: status === "ended"
								? days
								: 0;
					const percentUsed = c.amount > 0 ? (spent / c.amount) * 100 : 0;

					return (
						<CampaignListItem
							key={c.id}
							campaign={c}
							status={status}
							availableBalance={
								status === "ended"
									? getFinalBalance(c, entries)
									: status === "active"
										? getAvailableBalance(c, entries, today)
										: undefined
							}
							dailyLimit={getDailyLimit(c)}
							totalDays={days}
							currentDay={
								status === "active" ? getCurrentDay(c, today) : undefined
							}
							totalSpent={spent}
							daysUntilStart={
								status === "future"
									? differenceInCalendarDays(parseISO(c.startDate), parseISO(today))
									: undefined
							}
							percentUsed={percentUsed}
							elapsedDays={elapsed}
						/>
					);
				})}
			</div>
		);
	}

	return (
		<div>
			{/* Page Header */}
			<header className="mb-10">
				<h1 className="font-sora font-extrabold text-4xl tracking-tight text-on-surface mb-2">
					Campanhas
				</h1>
				<p className="font-mono text-sm text-on-surface-variant uppercase tracking-widest">
					Controle Financeiro Arquitetural
				</p>
			</header>

			{/* Tabs */}
			<CampaignTabs
				activeContent={renderCampaigns(grouped.active, "active")}
				futureContent={renderCampaigns(grouped.future, "future")}
				endedContent={renderCampaigns(grouped.ended, "ended")}
				counts={{
					active: grouped.active.length,
					future: grouped.future.length,
					ended: grouped.ended.length,
				}}
			/>

			{/* FAB */}
			<Link
				href="/campaigns/new"
				className="fixed bottom-24 right-6 bg-ds-primary text-on-primary w-14 h-14 rounded-xl flex items-center justify-center shadow-[0_10px_40px_rgba(173,198,255,0.3)] hover:scale-105 active:scale-95 transition-transform z-40"
			>
				<Plus className="w-6 h-6" />
			</Link>
		</div>
	);
}
