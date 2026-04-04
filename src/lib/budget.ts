import {
  differenceInCalendarDays,
  parseISO,
  format,
  eachDayOfInterval,
  isBefore,
  isAfter,
} from "date-fns";

export interface CampaignData {
  amount: number;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
}

export interface ExpenseEntry {
  amount: number;
  date: string; // "YYYY-MM-DD"
}

export interface DailyBreakdown {
  date: string;
  dailyLimit: number;
  expenses: number;
  balance: number;
  cumulativeSpent: number;
  cumulativeBudget: number;
}

export type CampaignStatus = "future" | "active" | "ended";

export function getCampaignDays(campaign: CampaignData): number {
  return (
    differenceInCalendarDays(
      parseISO(campaign.endDate),
      parseISO(campaign.startDate)
    ) + 1
  );
}

export function getDailyLimit(campaign: CampaignData): number {
  return campaign.amount / getCampaignDays(campaign);
}

export function getCampaignStatus(
  campaign: CampaignData,
  today: string
): CampaignStatus {
  const todayDate = parseISO(today);
  const start = parseISO(campaign.startDate);
  const end = parseISO(campaign.endDate);

  if (isBefore(todayDate, start)) return "future";
  if (isAfter(todayDate, end)) return "ended";
  return "active";
}

/**
 * Core calculation: available balance for a given date.
 * Formula: daily_limit × days_elapsed - total_spent_so_far
 */
export function getAvailableBalance(
  campaign: CampaignData,
  expenses: ExpenseEntry[],
  targetDate: string
): number {
  const dailyLimit = getDailyLimit(campaign);
  const start = parseISO(campaign.startDate);
  const target = parseISO(targetDate);

  const daysElapsed = differenceInCalendarDays(target, start) + 1;
  const cumulativeBudget = dailyLimit * daysElapsed;

  const totalSpent = expenses
    .filter((e) => parseISO(e.date) <= target)
    .reduce((sum, e) => sum + e.amount, 0);

  return cumulativeBudget - totalSpent;
}

/**
 * Full daily breakdown for charts and detail views.
 */
export function getDailyBreakdown(
  campaign: CampaignData,
  expenses: ExpenseEntry[],
  today: string
): DailyBreakdown[] {
  const dailyLimit = getDailyLimit(campaign);
  const start = parseISO(campaign.startDate);
  const end = parseISO(campaign.endDate);
  const todayDate = parseISO(today);

  const lastDate = isBefore(todayDate, end) ? todayDate : end;
  if (isBefore(lastDate, start)) return [];

  const days = eachDayOfInterval({ start, end: lastDate });

  const expensesByDate = new Map<string, number>();
  for (const e of expenses) {
    expensesByDate.set(e.date, (expensesByDate.get(e.date) ?? 0) + e.amount);
  }

  let cumulativeSpent = 0;
  let cumulativeBudget = 0;

  return days.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayExpenses = expensesByDate.get(dateStr) ?? 0;
    cumulativeSpent += dayExpenses;
    cumulativeBudget += dailyLimit;

    return {
      date: dateStr,
      dailyLimit,
      expenses: dayExpenses,
      balance: cumulativeBudget - cumulativeSpent,
      cumulativeSpent,
      cumulativeBudget,
    };
  });
}

export function getFinalBalance(
  campaign: CampaignData,
  expenses: ExpenseEntry[]
): number {
  return getAvailableBalance(campaign, expenses, campaign.endDate);
}

export function getDaysRemaining(campaign: CampaignData, today: string): number {
  const todayDate = parseISO(today);
  const end = parseISO(campaign.endDate);
  return Math.max(0, differenceInCalendarDays(end, todayDate) + 1);
}

export function getCurrentDay(campaign: CampaignData, today: string): number {
  const todayDate = parseISO(today);
  const start = parseISO(campaign.startDate);
  return differenceInCalendarDays(todayDate, start) + 1;
}

export function getTotalSpent(expenses: ExpenseEntry[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}
