import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { getAccessToken, refreshAccessTokenSilently } from "./auth/tokenStorage";

const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || "";

const httpLink = createHttpLink({
	uri: graphqlUrl,
	credentials: "include",
});

const authLink = setContext(async (_, { headers }) => {
	let token = getAccessToken();
	if (!token) {
		// Attempt refresh once per boot if possible
		try {
			token = await refreshAccessTokenSilently();
		} catch {
			// ignore
		}
	}
	return {
		headers: {
			...headers,
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
	};
});

const errorLink = onError((errorResponse) => {
	const graphQLErrors = (errorResponse as any).graphQLErrors as Array<any> | undefined;
	const networkError = (errorResponse as any).networkError as any;
	const operation = (errorResponse as any).operation;
	const forward = (errorResponse as any).forward as (op: any) => any;
	if (graphQLErrors?.length) {
		for (const err of graphQLErrors) {
			if (err?.extensions?.code === "UNAUTHENTICATED") {
				return refreshAccessTokenSilently()
					.then((token) => {
						if (!token) return;
						const oldHeaders = operation.getContext().headers || {};
						operation.setContext({
							headers: {
								...oldHeaders,
								Authorization: `Bearer ${token}`,
							},
						});
						return forward(operation);
					})
					.catch(() => {}) as any;
			}
		}
	}
	if (networkError) {
		// eslint-disable-next-line no-console
		console.error(networkError);
	}
});

export const apolloClient = new ApolloClient({
	link: from([errorLink, authLink, httpLink]),
	cache: new InMemoryCache({
		typePolicies: {
			Query: {
				fields: {
					// Add common pagination or caching strategies here
				},
			},
		},
	}),
});


