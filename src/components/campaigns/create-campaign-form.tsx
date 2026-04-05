"use client";

import { differenceInCalendarDays } from "date-fns";
import { LineChart } from "lucide-react";
import { useActionState, useState } from "react";
import {
	type CampaignActionState,
	createCampaign,
} from "@/lib/actions/campaigns";
import { formatCurrency } from "@/lib/format";

const initialState: CampaignActionState = {};

export function CreateCampaignForm() {
	const [state, formAction, isPending] = useActionState(
		createCampaign,
		initialState,
	);
	const [amount, setAmount] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	// Live preview calculation
	const numAmount = parseFloat(amount) || 0;
	const days =
		startDate && endDate
			? differenceInCalendarDays(new Date(endDate), new Date(startDate)) + 1
			: 0;
	const dailyLimit = days > 0 && numAmount > 0 ? numAmount / days : 0;
	const showPreview = days > 0 && numAmount > 0;

	return (
		<form action={formAction} className="space-y-8">
			{/* Campaign Name */}
			<div className="space-y-2">
				<label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant font-sora">
					Nome da campanha
				</label>
				<input
					name="name"
					type="text"
					required
					className="w-full bg-transparent border-0 border-b border-outline-variant/30 px-0 py-3 text-on-surface focus:ring-0 focus:border-ds-primary transition-all text-lg font-sora placeholder:text-on-surface-variant/40"
					placeholder="Ex: Férias de verão 2026"
				/>
				{state.error?.name && (
					<p className="text-xs text-error">{state.error.name[0]}</p>
				)}
			</div>

			{/* Total Amount */}
			<div className="space-y-2">
				<label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant font-sora">
					Valor total
				</label>
				<div className="relative flex items-center">
					<span className="absolute left-0 text-2xl font-mono text-ds-primary">
						R$
					</span>
					<input
						name="amount"
						type="number"
						step="0.01"
						min="0.01"
						required
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						className="w-full bg-transparent border-0 border-b border-outline-variant/30 pl-12 py-3 text-4xl font-mono text-on-surface focus:ring-0 focus:border-ds-primary transition-all placeholder:text-on-surface-variant/20"
						placeholder="0,00"
					/>
				</div>
				{state.error?.amount && (
					<p className="text-xs text-error">{state.error.amount[0]}</p>
				)}
			</div>

			{/* Date Range */}
			<div className="grid grid-cols-2 gap-8">
				<div className="space-y-2">
					<label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant font-sora">
						Data de início
					</label>
					<input
						name="startDate"
						type="date"
						required
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						className="w-full bg-surface-container-low border-0 border-b border-outline-variant/30 px-0 py-3 text-on-surface focus:ring-0 focus:border-ds-primary transition-all font-mono"
					/>
					{state.error?.startDate && (
						<p className="text-xs text-error">{state.error.startDate[0]}</p>
					)}
				</div>
				<div className="space-y-2">
					<label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant font-sora">
						Data de fim
					</label>
					<input
						name="endDate"
						type="date"
						required
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						className="w-full bg-surface-container-low border-0 border-b border-outline-variant/30 px-0 py-3 text-on-surface focus:ring-0 focus:border-ds-primary transition-all font-mono"
					/>
					{state.error?.endDate && (
						<p className="text-xs text-error">{state.error.endDate[0]}</p>
					)}
				</div>
			</div>

			{/* Live Preview Card */}
			{showPreview && (
				<div className="relative overflow-hidden bg-surface-container-low rounded-lg p-6 border-l-4 border-ds-primary shadow-[0_10px_40px_rgba(173,198,255,0.05)]">
					<div className="flex justify-between items-start mb-4">
						<div className="space-y-1">
							<p className="text-xs font-semibold uppercase tracking-widest text-ds-primary font-sora">
								Pré-visualização
							</p>
							<h3 className="text-xl font-bold font-sora text-on-surface">
								São {days} dia{days !== 1 ? "s" : ""}
							</h3>
						</div>
						<LineChart className="w-6 h-6 text-ds-primary/40" />
					</div>
					<div className="bg-surface-container-high/50 p-4 rounded border border-outline-variant/10">
						<p className="text-on-surface-variant text-sm mb-1 font-sora">
							Seu limite diário será
						</p>
						<p className="text-3xl font-mono text-ds-secondary tracking-tighter">
							{formatCurrency(dailyLimit)}/dia
						</p>
					</div>
					<div className="absolute -right-10 -bottom-10 w-32 h-32 bg-ds-primary/5 blur-3xl rounded-full" />
				</div>
			)}

			{/* CTA Button */}
			<button
				type="submit"
				disabled={isPending}
				className="w-full bg-ds-secondary py-5 rounded text-on-secondary font-bold font-sora text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-ds-secondary/10 disabled:opacity-50"
			>
				{isPending ? "Criando..." : "Iniciar Campanha"}
			</button>
		</form>
	);
}
