import { AlertTriangle } from "lucide-react";

interface NegativeBalanceAlertProps {
	campaignNames: string[];
}

export function NegativeBalanceAlert({
	campaignNames,
}: NegativeBalanceAlertProps) {
	if (campaignNames.length === 0) return null;

	return (
		<div className="mb-12 bg-tertiary-container/10 border-l-4 border-tertiary p-5 rounded-lg flex items-center gap-4">
			<AlertTriangle className="w-5 h-5 text-tertiary flex-shrink-0" />
			<p className="font-sora text-sm text-on-surface font-medium">
				Déficit detectado:{" "}
				{campaignNames.length === 1 ? (
					<>
						Campanha{" "}
						<span className="font-mono text-tertiary">{campaignNames[0]}</span>{" "}
						está com saldo negativo.
					</>
				) : (
					<>
						Campanhas{" "}
						<span className="font-mono text-tertiary">
							{campaignNames.join(", ")}
						</span>{" "}
						estão com saldo negativo.
					</>
				)}
			</p>
		</div>
	);
}
