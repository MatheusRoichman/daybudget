import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
	return (
		<div className="min-h-[60vh] flex items-center justify-center">
			<div className="w-full max-w-sm bg-surface-container-high rounded-2xl p-8 border border-outline-variant/30">
				<h1 className="font-sora text-2xl font-bold text-on-surface mb-2">
					DayBudget
				</h1>
				<p className="text-on-surface-variant font-mono text-sm mb-8">
					Acesso restrito. Insira a senha para continuar.
				</p>
				<LoginForm />
			</div>
		</div>
	);
}
