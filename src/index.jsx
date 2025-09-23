import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext';
import { SucursalProvider } from './context/SucursalContext';
import { DatosUsuarioProvider } from './context/DatosUsuarioContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <SucursalProvider>
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <DatosUsuarioProvider>
          <App />
          </DatosUsuarioProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  </SucursalProvider>
);
