import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

export default function VerificarContrato() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [contrato, setContrato] = useState(null);
  const [estado, setEstado] = useState('Verificando...');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const intervaloRef = useRef(null);

  const [formData, setFormData] = useState({
    direccion: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    tipo_domicilio: 'personal'
  });

  useEffect(() => {
    const verificar = async () => {
      try {
        const resp = await fetch(`${API_URL}/api/contratos/compra-venta/${id}`);
        const data = await resp.json();

        if (resp.ok && data.contrato) {
          setContrato(data.contrato);
          if (data.contrato.estado_contrato === 'FIRMADO') {
            setEstado('✅ Contrato completado correctamente.');
            setMostrarFormulario(true);
            navigate(`/pantalla-instalacion`);
            // Detener el intervalo al estar completado
            if (intervaloRef.current) {
              clearInterval(intervaloRef.current);
              intervaloRef.current = null;
            }
          } else {
            setEstado('❌ El contrato aún no está completado.');
            setMostrarFormulario(false);
          }
        } else {
          setEstado('Contrato no encontrado.');
          setMostrarFormulario(false);
        }
      } catch (e) {
        console.error(e);
        setEstado('Error al verificar el contrato.');
        setMostrarFormulario(false);
      }
    };

    // Primer chequeo inmediato
    verificar();

    // Chequeo repetido cada 10 segundos mientras no esté completado
    intervaloRef.current = setInterval(() => {
      verificar();
    }, 10000);

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    };
  }, [id, API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const resp = await fetch(`${API_URL}/users/agregar-domicilio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: contrato.cliente_id,
          direccion: formData.direccion,
          colonia: formData.colonia,
          ciudad: formData.ciudad,
          estado: formData.estado_contrato,
          codigo_postal: formData.codigo_postal,
          tipo_domicilio: formData.tipo_domicilio,
        }),
      });

      if (resp.ok) {
        // Redirige a la página de historial crediticio
      } else {
        const data = await resp.json();
        alert('Error: ' + (data.error || 'No se pudo agregar domicilio'));
      }
    } catch (error) {
      alert('Error al enviar el formulario.');
      console.error(error);
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: '100vh', padding: '2rem' }}
    >
      <h2 className="text-center mb-4">Verificación de Contrato</h2>

      <p className="text-center">{estado}</p>

      {contrato && (
        <div className="mb-4 text-center">
          <p><strong>ID:</strong> {contrato.id}</p>
          <p><strong>Cliente:</strong> {contrato.cliente_id}</p>
          <p><strong>Estado:</strong> {contrato.estado_contrato}</p>
        </div>
      )}

      
    </div>
  );
}