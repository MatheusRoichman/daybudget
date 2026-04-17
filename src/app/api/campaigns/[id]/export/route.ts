import type { NextRequest } from "next/server";
import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";
import { getCampaignDays, getDailyLimit, getTotalSpent } from "@/lib/budget";
import { getCampaignWithExpenses } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sanitizeFilename(name: string): string {
	return name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

function toArrayBuffer(buf: Buffer): ArrayBuffer {
	const ab = new ArrayBuffer(buf.length);
	new Uint8Array(ab).set(buf);
	return ab;
}

function csvEscape(value: string): string {
	// Prefix formula-injection characters so spreadsheet apps don't execute them
	const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
	if (safe.includes(",") || safe.includes('"') || safe.includes("\n")) {
		return `"${safe.replace(/"/g, '""')}"`;
	}
	return safe;
}

function formatBRL(amount: number): string {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(amount);
}

function formatDatePtBR(dateStr: string): string {
	return new Date(`${dateStr}T00:00:00`).toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	if (!/^\d+$/.test(id)) {
		return new Response("ID de campanha inválido", { status: 400 });
	}
	const campaignId = parseInt(id, 10);

	const result = await getCampaignWithExpenses(campaignId);
	if (!result) {
		return new Response("Campanha não encontrada", { status: 404 });
	}

	const { expenses, ...campaign } = result;
	const url = new URL(_req.url);
	const format = url.searchParams.get("format") ?? "csv";

	const sortedExpenses = [...expenses].sort(
		(a, b) => a.date.localeCompare(b.date) || a.id - b.id,
	);
	const expenseEntries = sortedExpenses.map((e) => ({
		amount: e.amount,
		date: e.date,
	}));
	const totalSpent = getTotalSpent(expenseEntries);
	const totalDays = getCampaignDays(campaign);
	const dailyLimit = getDailyLimit(campaign);
	const baseName = sanitizeFilename(campaign.name);

	switch (format) {
		case "csv":
			return buildCSV(
				campaign,
				sortedExpenses,
				totalSpent,
				totalDays,
				dailyLimit,
				baseName,
			);
		case "xlsx":
			return buildXLS(
				campaign,
				sortedExpenses,
				totalSpent,
				totalDays,
				dailyLimit,
				baseName,
			);
		case "pdf":
			return buildPDF(
				campaign,
				sortedExpenses,
				totalSpent,
				totalDays,
				dailyLimit,
				baseName,
			);
		default:
			return new Response("Formato inválido. Use csv, xlsx ou pdf.", {
				status: 400,
			});
	}
}

// ── CSV ──────────────────────────────────────────────────────────────────────

function buildCSV(
	campaign: {
		name: string;
		amount: number;
		startDate: string;
		endDate: string;
	},
	expenses: Array<{ date: string; description: string; amount: number }>,
	totalSpent: number,
	totalDays: number,
	dailyLimit: number,
	baseName: string,
): Response {
	const rows: string[][] = [
		["Campanha", campaign.name],
		["Orçamento total", formatBRL(campaign.amount)],
		["Início", formatDatePtBR(campaign.startDate)],
		["Fim", formatDatePtBR(campaign.endDate)],
		["Total de dias", String(totalDays)],
		["Limite diário", formatBRL(dailyLimit)],
		["Total gasto", formatBRL(totalSpent)],
		["Saldo", formatBRL(campaign.amount - totalSpent)],
		[],
		["Data", "Descrição", "Valor"],
		...expenses.map((e) => [
			formatDatePtBR(e.date),
			e.description,
			formatBRL(e.amount),
		]),
		[],
		["", "Total gasto", formatBRL(totalSpent)],
	];

	const csv = rows
		.map((row) => row.map((cell) => csvEscape(String(cell))).join(","))
		.join("\r\n");

	return new Response(csv, {
		headers: {
			"Content-Type": "text/csv; charset=utf-8",
			"Content-Disposition": `attachment; filename="${baseName}_gastos.csv"`,
			"Cache-Control": "no-store",
		},
	});
}

// ── XLS ──────────────────────────────────────────────────────────────────────

function buildXLS(
	campaign: {
		name: string;
		amount: number;
		startDate: string;
		endDate: string;
	},
	expenses: Array<{ date: string; description: string; amount: number }>,
	totalSpent: number,
	totalDays: number,
	dailyLimit: number,
	baseName: string,
): Response {
	const wb = XLSX.utils.book_new();

	// Summary sheet
	const summaryRows = [
		["Campanha", campaign.name],
		["Orçamento total", campaign.amount],
		["Início", formatDatePtBR(campaign.startDate)],
		["Fim", formatDatePtBR(campaign.endDate)],
		["Total de dias", totalDays],
		["Limite diário", dailyLimit],
		["Total gasto", totalSpent],
		["Saldo", campaign.amount - totalSpent],
	];
	const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
	summarySheet["!cols"] = [{ wch: 20 }, { wch: 30 }];
	XLSX.utils.book_append_sheet(wb, summarySheet, "Resumo");

	// Expenses sheet
	const expensesRows = [
		["Data", "Descrição", "Valor (R$)"],
		...expenses.map((e) => [formatDatePtBR(e.date), e.description, e.amount]),
		[],
		["", "Total gasto", totalSpent],
	];
	const expensesSheet = XLSX.utils.aoa_to_sheet(expensesRows);
	expensesSheet["!cols"] = [{ wch: 14 }, { wch: 40 }, { wch: 14 }];
	XLSX.utils.book_append_sheet(wb, expensesSheet, "Gastos");

	const xlsBuffer: Buffer = XLSX.write(wb, {
		type: "buffer",
		bookType: "xlsx",
	});

	return new Response(toArrayBuffer(xlsBuffer), {
		headers: {
			"Content-Type":
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"Content-Disposition": `attachment; filename="${baseName}_gastos.xlsx"`,
			"Cache-Control": "no-store",
		},
	});
}

// ── PDF ──────────────────────────────────────────────────────────────────────

function buildPDF(
	campaign: {
		name: string;
		amount: number;
		startDate: string;
		endDate: string;
	},
	expenses: Array<{ date: string; description: string; amount: number }>,
	totalSpent: number,
	totalDays: number,
	dailyLimit: number,
	baseName: string,
): Promise<Response> {
	return new Promise((resolve) => {
		const doc = new PDFDocument({ margin: 50, size: "A4" });
		const chunks: Buffer[] = [];
		let settled = false;

		const fail = () => {
			if (settled) return;
			settled = true;
			resolve(new Response("Falha ao gerar o PDF.", { status: 500 }));
		};

		doc.on("data", (chunk: Buffer) => chunks.push(chunk));
		doc.on("error", fail);
		doc.on("end", () => {
			if (settled) return;
			try {
				const pdf = Buffer.concat(chunks);
				settled = true;
				resolve(
					new Response(toArrayBuffer(pdf), {
						headers: {
							"Content-Type": "application/pdf",
							"Content-Disposition": `attachment; filename="${baseName}_gastos.pdf"`,
							"Cache-Control": "no-store",
						},
					}),
				);
			} catch {
				fail();
			}
		});

		const pageWidth = doc.page.width - 100; // left + right margin = 100

		// ── Title ──
		doc.fontSize(22).font("Helvetica-Bold").text(campaign.name, {
			align: "center",
		});
		doc.moveDown(0.3);
		doc
			.fontSize(10)
			.font("Helvetica")
			.fillColor("#666666")
			.text(
				`${formatDatePtBR(campaign.startDate)}  —  ${formatDatePtBR(campaign.endDate)}`,
				{ align: "center" },
			);
		doc.moveDown(1);

		// ── Summary grid ──
		doc.fillColor("#000000");
		const summaryItems = [
			["Orçamento total", formatBRL(campaign.amount)],
			["Total gasto", formatBRL(totalSpent)],
			["Saldo", formatBRL(campaign.amount - totalSpent)],
			["Total de dias", String(totalDays)],
			["Limite diário", formatBRL(dailyLimit)],
			["Nº de lançamentos", String(expenses.length)],
		];

		const colW = pageWidth / 3;
		const startX = 50;
		let sx = startX;
		let sy = doc.y;

		for (let i = 0; i < summaryItems.length; i++) {
			const [label, value] = summaryItems[i];
			if (i > 0 && i % 3 === 0) {
				sx = startX;
				sy += 44;
			}
			doc
				.fontSize(8)
				.font("Helvetica")
				.fillColor("#888888")
				.text(label, sx, sy, { width: colW - 10 });
			doc
				.fontSize(14)
				.font("Helvetica-Bold")
				.fillColor("#000000")
				.text(value, sx, sy + 12, { width: colW - 10 });
			sx += colW;
		}

		doc.moveDown(3.5);

		// ── Divider ──
		doc
			.moveTo(50, doc.y)
			.lineTo(50 + pageWidth, doc.y)
			.strokeColor("#cccccc")
			.lineWidth(0.5)
			.stroke();
		doc.moveDown(0.8);

		// ── Expenses table ──
		doc
			.fontSize(11)
			.font("Helvetica-Bold")
			.fillColor("#000000")
			.text("Gastos", { align: "left" });
		doc.moveDown(0.5);

		if (expenses.length === 0) {
			doc
				.fontSize(10)
				.font("Helvetica")
				.fillColor("#888888")
				.text("Nenhum gasto registrado.");
		} else {
			// Column widths (sum = pageWidth)
			const colDate = 80;
			const colDesc = pageWidth - colDate - 90;
			const colAmt = 90;

			const tableX = 50;
			let tableY = doc.y;

			const renderTableHeader = (y: number) => {
				doc.rect(tableX, y, pageWidth, 18).fill("#f0f0f0");
				doc
					.fontSize(8)
					.font("Helvetica-Bold")
					.fillColor("#333333")
					.text("DATA", tableX + 4, y + 4, { width: colDate, lineBreak: false })
					.text("DESCRIÇÃO", tableX + colDate + 4, y + 4, {
						width: colDesc,
						lineBreak: false,
					})
					.text("VALOR", tableX + colDate + colDesc + 4, y + 4, {
						width: colAmt - 8,
						align: "right",
						lineBreak: false,
					});
				return y + 18;
			};

			// Header row
			tableY = renderTableHeader(tableY);

			// Data rows
			for (let i = 0; i < expenses.length; i++) {
				const e = expenses[i];

				// Page break — re-render header on the new page
				if (tableY > doc.page.height - 130) {
					doc.addPage();
					tableY = renderTableHeader(50);
				}

				const rowBg = i % 2 === 0 ? "#ffffff" : "#fafafa";
				doc.rect(tableX, tableY, pageWidth, 18).fill(rowBg);

				doc
					.fontSize(9)
					.font("Helvetica")
					.fillColor("#000000")
					.text(formatDatePtBR(e.date), tableX + 4, tableY + 4, {
						width: colDate,
						lineBreak: false,
					})
					.text(e.description, tableX + colDate + 4, tableY + 4, {
						width: colDesc,
						lineBreak: false,
						ellipsis: true,
					})
					.text(
						formatBRL(e.amount),
						tableX + colDate + colDesc + 4,
						tableY + 4,
						{
							width: colAmt - 8,
							align: "right",
							lineBreak: false,
						},
					);

				tableY += 18;
			}

			// Total row
			doc.rect(tableX, tableY, pageWidth, 20).fill("#eeeeee");
			doc
				.fontSize(9)
				.font("Helvetica-Bold")
				.fillColor("#000000")
				.text("TOTAL GASTO", tableX + 4, tableY + 5, {
					width: colDate + colDesc,
				})
				.text(
					formatBRL(totalSpent),
					tableX + colDate + colDesc + 4,
					tableY + 5,
					{
						width: colAmt - 8,
						align: "right",
					},
				);

			doc.y = tableY + 30;
		}

		// ── Footer ──
		doc
			.fontSize(8)
			.font("Helvetica")
			.fillColor("#aaaaaa")
			.text(
				`Gerado em ${new Date().toLocaleDateString("pt-BR")} — DayBudget`,
				50,
				doc.page.height - 40,
				{ align: "center", width: pageWidth },
			);

		doc.end();
	});
}
