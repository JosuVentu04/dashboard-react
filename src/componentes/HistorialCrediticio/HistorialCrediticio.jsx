import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Catalogo from '../Catalogo';

export default function HistorialCrediticio() {
  const { userId } = useParams();
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creditoNegado, setCreditoNegado] = useState(false);
  const [motivoNegacion, setMotivoNegacion] = useState('');
  const [modelos, setModelos] = useState([]); // 📱 Lista de modelos
  const [busqueda, setBusqueda] = useState(''); // 🔍 Texto de búsqueda
  const [modeloSeleccionado, setModeloSeleccionado] = useState(null); // ✅ Modelo elegido
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
          body: JSON.stringify({ user_id: userId })
        });

        const data = await resp.json();

        if (resp.ok) {
          setHistorial(data);
          localStorage.removeItem("ContratoCreado");

          // 🧠 Verificación automática de deudas con PayJoy o Macropay
          const textoHistorial = JSON.stringify(data).toLowerCase();
          let aprobado = true;
          let motivo = "";

          if (textoHistorial.includes("payjoy") || textoHistorial.includes("macropay")) {
            aprobado = false;
            motivo = "El cliente presenta deudas activas con PayJoy o Macropay.";
            setCreditoNegado(true);
            setMotivoNegacion(motivo);
          }

          // 🧾 Extraer score del JSON de respuesta
          let score = null;
          try {
            const ficScoreObj = data?.resultado?.scores?.find(s => s.nombreScore === "FICO");
            score = ficScoreObj?.valor ?? null;
            console.log("Score FICO obtenido:", score);
          } catch (e) {
            console.warn("No se pudo obtener el score FICO:", e);
          }

          // 📤 Actualizar usuario con los datos obtenidos
          await fetch(`${API_URL}/users/editar-cliente/${userId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              score_crediticio: score,
              credito_aprobado: aprobado
            })
          });

          console.log("Usuario actualizado con score y estado de crédito");

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

  // 🧩 Obtener modelos del backend
  useEffect(() => {
    const fetchModelos = async () => {
      try {
        const resp = await fetch(`${API_URL}/devices/catalogo-modelos`);
        const data = await resp.json();
        setModelos(data);
      } catch (error) {
        console.error("Error obteniendo modelos:", error);
      }
    };

    fetchModelos();
  }, []);

  // 🔍 Filtrar modelos según búsqueda
  const modelosFiltrados = modelos.filter(m =>
    m.modelo.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return <p>Cargando historial crediticio...</p>;
  if (!historial) return <p>No se encontró historial.</p>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Historial Crediticio</h2>
      
      {creditoNegado ? (
        
        <div style={{
          backgroundColor: '#ffe5e5',
          border: '1px solid #ff0000',
          padding: '16px',
          borderRadius: '8px',
          color: '#a10000',
          marginBottom: '16px'
        }}>
          <h3>❌ Crédito Rechazado</h3>

          <p>{motivoNegacion}</p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#e8f8e8',
          border: '1px solid #00a000',
          padding: '16px',
          borderRadius: '8px',
          color: '#007000',
          marginBottom: '16px'
        }}>
          <h3>✅ Crédito Aprobado</h3>

          <p>No se encontraron deudas con PayJoy o Macropay.</p>
        </div>
      )}

      {/* 📱 Menú de selección de modelo (solo si está aprobado) */}

      {!creditoNegado && (
        <div style={{ marginTop: 24 }}>
          <h3>📱 Selecciona el modelo que el cliente desea comprar</h3>

          <input
            type="text"
            placeholder="Buscar modelo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              marginBottom: '16px'
            }}
          />

          <div style={{
            maxHeight: '250px',
            overflowY: 'auto',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '8px'
          }}>
            {modelosFiltrados.length === 0 ? (
              <p style={{ textAlign: 'center' }}>No se encontraron modelos.</p>
            ) : (
              modelosFiltrados.map(m => (
                <div
                  key={m.id}
                  onClick={() => setModeloSeleccionado(m)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '6px',
                    backgroundColor: modeloSeleccionado?.id === m.id ? '#d6f5d6' : '#fff',
                    border: modeloSeleccionado?.id === m.id ? '1px solid #00a000' : '1px solid #ccc'
                  }}
                >
                  <strong>{m.modelo}</strong> — $
{m.precio}
                </div>
              ))
            )}
          </div>

          {modeloSeleccionado && (
  <div style={{
    marginTop: '16px',
    backgroundColor: '#f0fff0',
    border: '1px solid #00a000',
    borderRadius: '8px',
    padding: '12px'
  }}>
    <h4>📦 Modelo seleccionado:</h4>

    <p><strong>{modeloSeleccionado.modelo}</strong></p>

    <p>Precio: ${modeloSeleccionado.precio}</p>

    <button
      onClick={() => {
        const score = historial?.resultado?.scores?.find(s => s.nombreScore === "FICO")?.valor || 0;
        const esScoreBueno = score >= 600; // Puedes ajustar el umbral según tu criterio
        const incremento = esScoreBueno ? 0.40 : 0.45;
        const precioFinal = modeloSeleccionado.precio * (1 + incremento);
        const pagoMensual = precioFinal / 3;

        // Mostrar en consola los datos que se enviarán al formulario
        console.log("➡ Datos para el formulario de planes:", {
          modelo: modeloSeleccionado.modelo,
          precioBase: modeloSeleccionado.precio,
          score,
          incremento,
          precioFinal,
          pagoMensual
        });

        // Redirigir al formulario de planes
        window.location.href = `/planes?modelo=${encodeURIComponent(modeloSeleccionado.modelo)}&precioBase=${modeloSeleccionado.precio}&score=${score}`;
      }}
      style={{
        marginTop: '12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px'
      }}
    >
      Seleccionar plan
    </button>
  </div>
)}
        </div>
      )}

      {/* 🧾 Información del historial */}

      <pre style={{ background: '#f8f8f8', padding: 16, borderRadius: 8 }}>
        {/*JSON.stringify(historial, null, 2)*/}

        {<Catalogo />}
      </pre>
    </div>
  );
}