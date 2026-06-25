import { z } from "zod";
import { clearAccessToken, clearRefreshToken, getAccessToken, refreshAccessTokenSilently, setAccessToken, setRefreshToken } from "./tokenStorage";

const LoginResponseSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string().optional(),
	user: z
		.object({
			id: z.union([z.string(), z.number()]).transform(String),
			email: z.string().email().optional(),
			name: z.string().optional(),
			// extend as needed
		})
		.optional(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export async function loginWithPassword(email: string, password: string): Promise<LoginResponse> {
	const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
	const res = await fetch(`${baseUrl.replace(/\/$/, "")}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
		credentials: "include",
	});
	if (!res.ok) {
		const message = await safeErrorMessage(res);
		throw new Error(message);
	}
	const data = await res.json();
	const parsed = LoginResponseSchema.parse(data);
	setAccessToken(parsed.accessToken);
	if (parsed.refreshToken) setRefreshToken(parsed.refreshToken);
	return parsed;
}

export async function logout() {
	clearAccessToken();
	clearRefreshToken();
}

export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit, retryOn401 = true) {
	const withAuth = async (): Promise<Response> => {
		const token = getAccessToken();
		const headers = new Headers(init?.headers || {});
		if (token) headers.set("Authorization", `Bearer ${token}`);
		return fetch(input, { ...init, headers, credentials: "include" });
	};
	let res = await withAuth();
	if (res.status === 401 && retryOn401) {
		const token = await refreshAccessTokenSilently();
		if (token) {
			res = await withAuth();
		}
	}
	return res;
}

async function safeErrorMessage(res: Response): Promise<string> {
	try {
		const data = (await res.json());
		return data?.message || `Request failed with status ${res.status}`;
	} catch {
		return `Request failed with status ${res.status}`;
	}
}


