import { createContext, useContext, useState } from 'react';

const DatosUsuarioContext = createContext();

export function DatosUsuarioProvider({ children }) {
  const [datosUsuario, setDatosUsuario] = useState({ nombre: '', apellido: '' });

  return (
    <DatosUsuarioContext.Provider value={{ datosUsuario, setDatosUsuario }}>
      {children}
    </DatosUsuarioContext.Provider>
  );
}

export function useDatosUsuario() {
  return useContext(DatosUsuarioContext);
}