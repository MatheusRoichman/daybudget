import { z } from "zod/v4";

export const createCampaignSchema = z
	.object({
		name: z.string().min(1, "Nome é obrigatório").max(100),
		amount: z.coerce.number().positive("Valor deve ser positivo"),
		startDate: z
			.string()
			.regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido"),
		endDate: z
			.string()
			.regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido"),
	})
	.refine((data) => new Date(data.endDate) > new Date(data.startDate), {
		message: "Data final deve ser após a data inicial",
		path: ["endDate"],
	});

export const createExpenseSchema = z.object({
	campaignId: z.coerce.number().int().positive(),
	description: z.string().min(1, "Descrição é obrigatória").max(200),
	amount: z.coerce.number().positive("Valor deve ser positivo"),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido"),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
