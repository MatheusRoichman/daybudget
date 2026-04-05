"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { getToday } from "@/lib/get-today";
import { createCampaignSchema } from "@/lib/validations";

export type CampaignActionState = {
	error?: Record<string, string[]>;
	success?: boolean;
};

export async function createCampaign(
	_prevState: CampaignActionState,
	formData: FormData,
): Promise<CampaignActionState> {
	const raw = {
		name: formData.get("name"),
		amount: formData.get("amount"),
		startDate: formData.get("startDate"),
		endDate: formData.get("endDate"),
	};

	const parsed = createCampaignSchema.safeParse(raw);
	if (!parsed.success) {
		const fieldErrors: Record<string, string[]> = {};
		for (const issue of parsed.error.issues) {
			const path = String(issue.path[0]);
			if (!fieldErrors[path]) fieldErrors[path] = [];
			fieldErrors[path].push(issue.message);
		}
		return { error: fieldErrors };
	}

	const today = await getToday();
	if (parsed.data.startDate < today) {
		return { error: { startDate: ["Data inicial não pode ser no passado"] } };
	}

	const result = await db.insert(campaigns).values(parsed.data).returning();

	revalidatePath("/campaigns");
	revalidatePath("/");
	redirect(`/campaigns/${result[0].id}`);
}

export async function deleteCampaign(id: number) {
	db.delete(campaigns).where(eq(campaigns.id, id)).run();
	revalidatePath("/campaigns");
	revalidatePath("/");
	redirect("/campaigns");
}
