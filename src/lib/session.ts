export const SESSION_COOKIE = "daybudget_session";

function bufToHex(buf: ArrayBuffer): string {
	return Array.from(new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

async function hmac(secret: string, data: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
	return bufToHex(sig);
}

export async function createSessionToken(): Promise<string> {
	return hmac(process.env.AUTH_SECRET!, "daybudget:session:v1");
}

export async function verifySessionToken(token: string): Promise<boolean> {
	const expected = await createSessionToken();
	return token === expected;
}
