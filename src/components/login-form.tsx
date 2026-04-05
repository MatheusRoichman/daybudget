"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import type { LoginState } from "@/app/actions/auth";

export function LoginForm() {
	const [state, action, pending] = useActionState<
		LoginState | undefined,
		FormData
	>(login, undefined);

	return (
		<form action={action} className="flex flex-col gap-4">
			<div className="flex flex-col gap-1.5">
				<label
					htmlFor="password"
					className="text-sm text-on-surface-variant font-mono"
				>
					Senha de acesso
				</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					autoFocus
					className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface font-mono focus:outline-none focus:border-ds-primary transition-colors"
					placeholder="••••••••"
				/>
				{state?.error && (
					<p className="text-error text-sm font-mono">{state.error}</p>
				)}
			</div>
			<button
				type="submit"
				disabled={pending}
				className="bg-ds-primary text-on-primary font-sora font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
			>
				{pending ? "Entrando..." : "Entrar"}
			</button>
		</form>
	);
}
