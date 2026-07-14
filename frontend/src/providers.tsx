import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store';
import { SessionProvider } from './context/SessionContext';
import { UserProvider } from './context/UserContext';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './lib/apolloClient';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ApolloProvider client={apolloClient}>
        <SessionProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </SessionProvider>
      </ApolloProvider>
    </ReduxProvider>
  );
}
