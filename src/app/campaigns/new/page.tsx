import { CreateCampaignForm } from "@/components/campaigns/create-campaign-form";

export default function NewCampaignPage() {
	return (
		<div className="max-w-2xl mx-auto">
			<header className="mb-10">
				<h1 className="text-4xl font-bold font-sora tracking-tight text-on-surface mb-2">
					Nova Campanha
				</h1>
				<p className="text-on-surface-variant font-sora">
					Defina seus limites e otimize seu gasto diário.
				</p>
			</header>
			<CreateCampaignForm />
		</div>
	);
}
