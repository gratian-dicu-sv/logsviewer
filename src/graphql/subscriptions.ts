import { gql } from '@apollo/client';

export const MESSAGE_RECEIVED = gql`
  subscription OnMessageReceived {
    messageReceived {
      device
      message
    }
  }
`;