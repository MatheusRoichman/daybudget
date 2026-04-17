"use client";

import { Download } from "lucide-react";
import { useState } from "react";

interface ExportMenuProps {
	campaignId: number;
}

const FORMATS = [
	{ key: "csv", label: "CSV" },
	{ key: "xlsx", label: "XLS" },
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

			const disposition = res.headers.get("content-disposition") ?? "";
			const contentType = res.headers.get("content-type") ?? "";
			// If we got redirected to /login or received HTML, session expired
			if (
				!res.ok ||
				res.redirected ||
				/\btext\/html\b/i.test(contentType) ||
				!/attachment/i.test(disposition)
			) {
				throw new Error("Resposta inválida");
			}

			const blob = await res.blob();
			const match = disposition.match(/filename="([^"]+)"/);
			const filename = match?.[1] ?? `campanha_${campaignId}_gastos.${format}`;

			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			a.remove();
			setTimeout(() => URL.revokeObjectURL(url), 0);
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
