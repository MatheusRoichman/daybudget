"use client";

import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface CampaignTabsProps {
	activeContent: ReactNode;
	futureContent: ReactNode;
	endedContent: ReactNode;
	counts: { active: number; future: number; ended: number };
}

const tabs = [
	{ key: "active", label: "Ativas" },
	{ key: "future", label: "Futuras" },
	{ key: "ended", label: "Encerradas" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export function CampaignTabs({
	activeContent,
	futureContent,
	endedContent,
	counts,
}: CampaignTabsProps) {
	const [activeTab, setActiveTab] = useState<TabKey>("active");

	const content: Record<TabKey, ReactNode> = {
		active: activeContent,
		future: futureContent,
		ended: endedContent,
	};

	return (
		<div>
			<div className="flex gap-8 mb-8 border-b border-outline-variant/10">
				{tabs.map(({ key, label }) => (
					<button
						key={key}
						onClick={() => setActiveTab(key)}
						className={cn(
							"pb-4 font-sora text-sm font-semibold transition-all",
							activeTab === key
								? "border-b-2 border-ds-primary text-ds-primary"
								: "text-on-surface-variant hover:text-on-surface",
						)}
					>
						{label} ({counts[key]})
					</button>
				))}
			</div>
			{content[activeTab]}
		</div>
	);
}
