import { Link } from "react-router-dom";

export default function VerificacionErronea() {
    return (
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <h2>Verificación Errónea</h2>
        <p>Hubo un problema al completar el proceso de verificación.</p>
        <p>Por favor, intenta nuevamente o contacta soporte si el problema persiste.</p>
        <div className="text-center">
        <Link
          to="/"
          className="boton-volver-inicio mb-5 p-2 btn btn-secondary mt-3"
        >
          Volver al inicio
        </Link>
      </div>
      </div>
      
    );
}