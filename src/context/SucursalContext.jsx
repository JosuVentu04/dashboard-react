import React, { createContext, useState, useContext } from 'react';

// Crear contexto
const SucursalContext = createContext();

// Proveedor para envolver tu app
export function SucursalProvider({ children }) {
  const [sucursal, setSucursalState] = useState(() => {
    // Inicializa leyendo del localStorage (si existe)
    const saved = localStorage.getItem('sucursal');
    return saved ? JSON.parse(saved) : null;
  });

  const setSucursal = (suc) => {
    setSucursalState(suc);
    if (suc) {
      localStorage.setItem('sucursal', JSON.stringify(suc));
    } else {
      localStorage.removeItem('sucursal');
    }
  };

  return (
    <SucursalContext.Provider value={{ sucursal, setSucursal }}>
      {children}
    </SucursalContext.Provider>
  );
}

// Hook para usar contexto fácilmente
export function useSucursal() {
  return useContext(SucursalContext);
} 