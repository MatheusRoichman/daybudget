import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { eq, and, lte, gte } from "drizzle-orm";

export async function getAllCampaigns() {
  return db.query.campaigns.findMany({
    orderBy: (campaigns, { desc }) => [desc(campaigns.createdAt)],
    with: { expenses: true },
  });
}

export async function getCampaignWithExpenses(id: number) {
  return db.query.campaigns.findFirst({
    where: eq(campaigns.id, id),
    with: { expenses: true },
  });
}

export async function getActiveCampaigns(today: string) {
  return db.query.campaigns.findMany({
    where: and(lte(campaigns.startDate, today), gte(campaigns.endDate, today)),
    with: { expenses: true },
  });
}
