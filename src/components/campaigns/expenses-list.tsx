"use client";

import { Trash2 } from "lucide-react";
import { deleteExpense } from "@/lib/actions/expenses";
import type { Expense } from "@/lib/db/schema";
import { formatCurrency, formatDate } from "@/lib/format";
import { ExportMenu } from "./export-menu";

interface ExpensesListProps {
	expenses: Expense[];
	campaignId: number;
}

export function ExpensesList({ expenses, campaignId }: ExpensesListProps) {
	const sorted = [...expenses].sort(
		(a, b) => b.date.localeCompare(a.date) || b.id - a.id,
	);

	return (
		<section className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-bold tracking-tight uppercase font-sora">
					Gastos Recentes
				</h3>
				<div className="flex items-center gap-3">
					<ExportMenu campaignId={campaignId} />
					<span className="text-xs text-on-surface-variant font-mono">
						{expenses.length} transaç{expenses.length !== 1 ? "ões" : "ão"}
					</span>
				</div>
			</div>

			{sorted.length === 0 ? (
				<p className="text-sm text-on-surface-variant text-center py-8 font-sora">
					Nenhum gasto registrado.
				</p>
			) : (
				<div className="space-y-3">
					{sorted.map((expense) => (
						<div
							key={expense.id}
							className="relative group cursor-pointer overflow-hidden rounded"
						>
							{/* Swipe delete area */}
							<div className="absolute inset-y-0 right-0 w-20 bg-error-container flex items-center justify-center translate-x-full group-hover:translate-x-0 transition-transform duration-300">
								<button
									onClick={() => deleteExpense(expense.id, campaignId)}
									className="text-error hover:text-on-surface transition-colors"
								>
									<Trash2 className="w-5 h-5" />
								</button>
							</div>

							{/* Blade content */}
							<div className="bg-surface-container-lowest p-4 flex items-center justify-between border-l-2 border-error hover:bg-surface-container-low transition-colors group-hover:-translate-x-20 duration-300">
								<div className="flex flex-col">
									<span className="text-sm font-bold text-on-surface font-sora">
										{expense.description}
									</span>
									<span className="text-[10px] font-mono text-on-surface-variant uppercase">
										{formatDate(expense.date)}
									</span>
								</div>
								<div className="text-right">
									<span className="text-lg font-mono font-medium text-error">
										{formatCurrency(expense.amount)}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
