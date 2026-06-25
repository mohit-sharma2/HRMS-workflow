This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) and extended with:

- Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- React Context session provider
- Zustand store (`stores/uiStore.ts`)
- Apollo Client (`@apollo/client`, `graphql`) with auth and error links
- Frontend authentication flow (login, token storage, middleware guard)

## Getting Started

1) Create environment file:

```
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_GRAPHQL_URL=https://api.example.com/graphql
```

2) Install dependencies:

```bash
npm install
```

3) Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Auth Flow
- Visit `/login` to authenticate. On success, an access token is stored in memory/localStorage and a non-HttpOnly cookie `auth_token` is set so `middleware.ts` can protect routes at the edge.
- API base URL and GraphQL URL come from `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_GRAPHQL_URL`.
- Apollo Client automatically attaches the `Authorization: Bearer <token>` header when available and attempts a silent refresh on GraphQL `UNAUTHENTICATED` errors.

### Key Files
- `app/providers.tsx`: Wires Redux, Apollo, Session context.
- `lib/auth/tokenStorage.ts`: Access/refresh token storage and silent refresh.
- `lib/auth/authService.ts`: `loginWithPassword`, `logout`, and `fetchWithAuth`.
- `lib/apolloClient.ts`: Apollo Client with auth and error links, caching.
- `middleware.ts`: Redirects to `/login` when unauthenticated.
- `store/*`: Redux Toolkit auth slice and store.
- `stores/uiStore.ts`: Example Zustand store.
- `app/(auth)/login/page.tsx`: Login page.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
