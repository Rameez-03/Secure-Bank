import React from 'react';
import ReactDOM from 'react-dom/client';
import { createGlobalStyle } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContextProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import App from './App.jsx';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    padding: 0;
    background: #0A0A0A;
    color: #FAFAFA;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
  }

  button, input, select, textarea {
    font-family: inherit;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #222222;
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #3F3F46;
  }
`;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
    <AuthContextProvider>
      <GlobalStyle />
      <App />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: '#141414',
          border: '1px solid #222222',
          color: '#FAFAFA',
          fontSize: '13px',
          borderRadius: '10px',
        }}
      />
    </AuthContextProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
