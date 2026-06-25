import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
	const envFlag = String(process.env.NEXT_PUBLIC_DISABLE_AUTH || "").toLowerCase();
	const disableAuthEnv = envFlag === "true" || envFlag === "1" || envFlag === "yes";
	// Runtime overrides for development convenience
	const disableParam = req.nextUrl.searchParams.get("disableAuth");
	const disableAuthParam = disableParam === "1" || (disableParam ?? "").toLowerCase() === "true";
	const disableAuthCookie = req.cookies.get("disable_auth")?.value === "1";

	if (disableAuthEnv || disableAuthCookie || disableAuthParam) {
		// Persist disable via cookie when provided through query param
		if (disableAuthParam) {
			const res = NextResponse.next();
			res.cookies.set("disable_auth", "1", { sameSite: "lax", path: "/" });
			return res;
		}
		return NextResponse.next();
	}
	const { pathname } = req.nextUrl;
	// Allow public paths
	if (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/favicon.ico") ||
		pathname.startsWith("/public") ||
		pathname.startsWith("/api") || // not using API routes but avoid interference
		pathname.startsWith("/login") ||
		pathname.startsWith("/examples")
	) {
		return NextResponse.next();
	}

	const token = req.cookies.get("auth_token")?.value;
	if (!token) {
		const url = req.nextUrl.clone();
		url.pathname = "/login";
		url.searchParams.set("next", pathname);
		return NextResponse.redirect(url);
	}
	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!_next|favicon.ico|public|api).*)"],
};


