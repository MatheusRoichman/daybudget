import { cookies } from "next/headers";

export async function getToday(): Promise<string> {
	const cookieStore = await cookies();
	const tz = cookieStore.get("tz")?.value;
	// en-CA locale produces YYYY-MM-DD, matching the app's date string format
	return new Intl.DateTimeFormat(
		"en-CA",
		tz ? { timeZone: tz } : undefined,
	).format(new Date());
}
