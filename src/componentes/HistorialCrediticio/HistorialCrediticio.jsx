import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function HistorialCrediticio() {
  const { userId } = useParams();
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const token = localStorage.getItem('token');
        const resp = await fetch(`${API_URL}/users/historial-crediticio`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ user_id: userId }) // Ajusta backend para aceptar user_id y buscar datos internamente
          
        });
        console.log("userId enviado:", userId);
        const data = await resp.json();
        if (resp.ok) {
          setHistorial(data);
          localStorage.removeItem("ContratoCreado")
        } else {
          alert('Error obteniendo historial crediticio');
        }
      } catch (e) {
        alert('Error en la solicitud del historial crediticio');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [userId]);

  if (loading) return <p>Cargando historial crediticio...</p>;
  if (!historial) return <p>No se encontró historial.</p>;

  return (
    <div>
      <h2>Historial Crediticio</h2>
      <pre>{JSON.stringify(historial, null, 2)}</pre>
    </div>
  );
}