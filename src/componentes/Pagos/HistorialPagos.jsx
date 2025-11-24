export default function HistorialPagos({ historial }) {
  if (!historial || historial.length === 0) {
    return <p className="text-muted">No hay pagos registrados aún.</p>;
  }

  return (
    <div className="card p-3 mt-4">
      <h4 className="mb-3">Historial de Pagos</h4>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Monto</th>
            <th>Método</th>
            <th>Fecha</th>
          </tr>
        </thead>

        <tbody>
          {historial.map((p) => (
            <tr key={p.id}>
              <td>${p.monto}</td>
              <td>{p.metodo}</td>
              <td>{new Date(p.fecha).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
