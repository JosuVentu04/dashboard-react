import { useSearchParams, Link } from 'react-router-dom';

export default function CorreoVerificado() {
  const [q]     = useSearchParams();
  const status  = q.get('status');            // ok | expired | invalid

  const info = {
    ok:      { txt: '¡Correo verificado con éxito!', tipo: 'success' },
    expired: { txt: 'El enlace ha expirado.',        tipo: 'warning' },
    invalid: { txt: 'El enlace no es válido.',       tipo: 'danger' }
  }[status] || info.invalid;

  return (
    <div className="container col-md-5 py-5 text-center">
      <div className={`alert alert-${info.tipo}`}>{info.txt}</div>
      <Link to="/login" className="btn btn-primary">Ir al login</Link>
    </div>
  );
}