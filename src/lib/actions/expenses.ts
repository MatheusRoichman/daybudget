"use server";

import { db } from "@/lib/db";
import { expenses, campaigns } from "@/lib/db/schema";
import { createExpenseSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ExpenseActionState = {
  error?: Record<string, string[]>;
  success?: boolean;
};

export async function addExpense(
  _prevState: ExpenseActionState,
  formData: FormData
): Promise<ExpenseActionState> {
  const raw = {
    campaignId: formData.get("campaignId"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    date: formData.get("date"),
  };

  const parsed = createExpenseSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = String(issue.path[0]);
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return { error: fieldErrors };
  }

  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, parsed.data.campaignId),
  });

  if (!campaign) {
    return { error: { campaignId: ["Campanha não encontrada"] } };
  }

  if (
    parsed.data.date < campaign.startDate ||
    parsed.data.date > campaign.endDate
  ) {
    return {
      error: { date: ["Data deve estar dentro do intervalo da campanha"] },
    };
  }

  db.insert(expenses).values(parsed.data).run();
  revalidatePath(`/campaigns/${parsed.data.campaignId}`);
  revalidatePath("/");

  return { success: true };
}

export async function deleteExpense(expenseId: number, campaignId: number) {
  db.delete(expenses).where(eq(expenses.id, expenseId)).run();
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/");
}
