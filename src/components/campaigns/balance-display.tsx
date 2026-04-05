import { differenceInCalendarDays, parseISO } from "date-fns";

interface BalanceDisplayProps {
	startDate: string;
}

export function FutureCampaignBanner({ startDate }: BalanceDisplayProps) {
	const daysUntil = differenceInCalendarDays(parseISO(startDate), new Date());
	return (
		<div className="py-8 text-center mb-10">
			<p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold font-sora mb-2">
				Status
			</p>
			<p className="text-3xl font-bold text-ds-primary font-sora">
				Começa em {daysUntil} dia{daysUntil !== 1 ? "s" : ""}
			</p>
		</div>
	);
}
