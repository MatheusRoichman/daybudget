import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (pathname.startsWith("/login")) {
		return NextResponse.next();
	}

	const token = request.cookies.get(SESSION_COOKIE)?.value;

	if (!token || !(await verifySessionToken(token))) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon\\.ico|icon|manifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
