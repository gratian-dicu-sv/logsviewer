import { gql } from '@apollo/client';

export const CREATE_MESSAGE = gql`
  mutation CreateMessage($input: MessageInput!) {
    createMessage(input: $input) {
      id
      content
      createdAt
    }
  }
`;

export const UPDATE_MESSAGE = gql`
  mutation UpdateMessage($id: ID!, $input: MessageInput!) {
    updateMessage(id: $id, input: $input) {
      id
      content
      updatedAt
    }
  }
`;

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($id: ID!) {
    deleteMessage(id: $id) {
      id
    }
  }
`;