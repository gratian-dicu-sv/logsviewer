import { createRoot } from 'react-dom/client'
import { client } from './apollo/client';

import './index.css';
import '@xyflow/react/dist/style.css';
import App from './App.jsx';
import { ApolloProvider } from '@apollo/client';


createRoot(document.getElementById('app')).render(
   <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
)
