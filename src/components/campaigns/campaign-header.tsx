"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteCampaign } from "@/lib/actions/campaigns";
import type { CampaignStatus } from "@/lib/budget";
import type { Campaign } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";

interface CampaignHeaderProps {
	campaign: Campaign;
	status: CampaignStatus;
}

const statusConfig: Record<
	CampaignStatus,
	{ label: string; bgClass: string; textClass: string; borderClass: string }
> = {
	active: {
		label: "Ativa",
		bgClass: "bg-ds-secondary/10",
		textClass: "text-ds-secondary",
		borderClass: "border-ds-secondary/20",
	},
	future: {
		label: "Futura",
		bgClass: "bg-ds-primary/10",
		textClass: "text-ds-primary",
		borderClass: "border-ds-primary/20",
	},
	ended: {
		label: "Encerrada",
		bgClass: "bg-on-surface-variant/10",
		textClass: "text-on-surface-variant",
		borderClass: "border-on-surface-variant/20",
	},
};

export function CampaignHeader({ campaign, status }: CampaignHeaderProps) {
	const [showConfirm, setShowConfirm] = useState(false);
	const { label, bgClass, textClass, borderClass } = statusConfig[status];

	return (
		<section className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
			<div>
				<div className="flex items-center gap-3 mb-1">
					<h2 className="text-3xl font-extrabold tracking-tight font-sora">
						{campaign.name}
					</h2>
					<span
						className={`${bgClass} ${textClass} text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-0.5 rounded-full border ${borderClass}`}
					>
						{label}
					</span>
				</div>
				<p className="text-on-surface-variant font-mono text-sm uppercase">
					{formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}
				</p>
			</div>

			{!showConfirm ? (
				<button
					onClick={() => setShowConfirm(true)}
					className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-container-highest transition-all px-4 py-2 rounded-lg border border-outline-variant/10 text-sm font-medium text-error"
				>
					<Trash2 className="w-4 h-4" />
					Excluir
				</button>
			) : (
				<div className="flex items-center gap-2">
					<button
						onClick={() => setShowConfirm(false)}
						className="px-4 py-2 rounded-lg border border-outline-variant/10 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-all"
					>
						Cancelar
					</button>
					<button
						onClick={() => deleteCampaign(campaign.id)}
						className="px-4 py-2 rounded-lg bg-error-container text-error text-sm font-bold hover:brightness-110 transition-all"
					>
						Confirmar exclusão
					</button>
				</div>
			)}
		</section>
	);
}
