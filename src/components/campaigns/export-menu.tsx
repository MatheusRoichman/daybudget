"use client";

import { Download } from "lucide-react";
import { useState } from "react";

interface ExportMenuProps {
	campaignId: number;
}

const FORMATS = [
	{ key: "csv", label: "CSV" },
	{ key: "xls", label: "XLS" },
	{ key: "pdf", label: "PDF" },
] as const;

export function ExportMenu({ campaignId }: ExportMenuProps) {
	const [loading, setLoading] = useState<string | null>(null);

	async function handleExport(format: string) {
		setLoading(format);
		try {
			const res = await fetch(
				`/api/campaigns/${campaignId}/export?format=${format}`,
			);
			if (!res.ok) throw new Error("Falha ao gerar exportação");

			const blob = await res.blob();
			const disposition = res.headers.get("content-disposition") ?? "";
			const match = disposition.match(/filename="([^"]+)"/);
			const filename = match?.[1] ?? `campanha_${campaignId}_gastos.${format}`;

			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);
		} catch {
			// silently fail — the browser will show a download error if needed
		} finally {
			setLoading(null);
		}
	}

	return (
		<div className="flex items-center gap-2">
			<Download className="w-3.5 h-3.5 text-on-surface-variant" />
			{FORMATS.map(({ key, label }) => (
				<button
					key={key}
					type="button"
					disabled={loading !== null}
					onClick={() => handleExport(key)}
					className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-outline-variant/20 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading === key ? "..." : label}
				</button>
			))}
		</div>
	);
}
