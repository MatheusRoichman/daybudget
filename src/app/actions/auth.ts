"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export type LoginState = { error?: string };

export async function login(
	_prev: LoginState | undefined,
	formData: FormData,
): Promise<LoginState> {
	const password = formData.get("password") as string;

	if (password !== process.env.AUTH_PASSWORD) {
		return { error: "Senha incorreta." };
	}

	const token = await createSessionToken();
	const cookieStore = await cookies();

	cookieStore.set(SESSION_COOKIE, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 30, // 30 days
		path: "/",
	});

	redirect("/");
}

export async function logout() {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION_COOKIE);
	redirect("/login");
}
