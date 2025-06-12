import { gql } from '@apollo/client';

export const GET_MESSAGES = gql`
  query GetMessages {
    messages {
      id
      content
      timestamp
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
    }
  }
`;