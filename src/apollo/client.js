import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';

import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql', // Replace with your GraphQL server URI
});

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:4000/graphql',
}));

// Using split to send data to each link depending on the operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});