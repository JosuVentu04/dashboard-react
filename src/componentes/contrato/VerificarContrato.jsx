import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function VerificarContrato() {
  const { id } = useParams(); // ← recibe el parámetro desde la URL
  const [contrato, setContrato] = useState(null);
  const [estado, setEstado] = useState('Verificando...');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const verificar = async () => {
      try {
        const resp = await fetch(`${API_URL}/api/contratos/${id}`);
        const data = await resp.json();

        if (resp.ok && data.contrato) {
          setContrato(data.contrato);
          setEstado(
            data.contrato.estado_contrato === 'FIRMADO'
              ? '✅ Contrato firmado correctamente.'
              : '❌ El contrato aún no está firmado.'
          );
        } else {
          setEstado('Contrato no encontrado.');
        }
      } catch (e) {
        console.error(e);
        setEstado('Error al verificar el contrato.');
      }
    };

    verificar();
  }, [id]);

  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <h2>Verificación de Contrato</h2>
      <p>{estado}</p>

      {contrato && (
        <div style={{ marginTop: 20 }}>
          <p><strong>ID:</strong> {contrato.id}</p>
          <p><strong>Cliente:</strong> {contrato.cliente_id}</p>
          <p><strong>Estado:</strong> {contrato.estado_contrato}</p>
        </div>
      )}
    </div>
  );
}