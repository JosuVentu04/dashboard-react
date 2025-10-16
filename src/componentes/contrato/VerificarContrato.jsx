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
        const resp = await fetch(`${API_URL}/api/contratos/${id}`);
        const data = await resp.json();

        if (resp.ok && data.contrato) {
          setContrato(data.contrato);
          if (data.contrato.estado_contrato === 'FIRMADO') {
            setEstado('✅ Contrato firmado correctamente.');
            setMostrarFormulario(true);
            // Detener el intervalo al estar firmado
            if (intervaloRef.current) {
              clearInterval(intervaloRef.current);
              intervaloRef.current = null;
            }
          } else {
            setEstado('❌ El contrato aún no está firmado.');
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

    // Chequeo repetido cada 10 segundos mientras no esté firmado
    intervaloRef.current = setInterval(() => {
      verificar();
    }, 10000);

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    };
  }, [id]);

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
          estado: formData.estado,
          codigo_postal: formData.codigo_postal,
          tipo_domicilio: formData.tipo_domicilio,
        }),
      });

      if (resp.ok) {
        // Redirige a la página de historial crediticio
        navigate(`/historial-crediticio/${contrato.cliente_id}`);
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

      {mostrarFormulario && (
        <form onSubmit={handleSubmit} style={{ marginTop: 30, textAlign: 'left', maxWidth: 400, margin: '30px auto' }}>
          <h3>Agregar Domicilio</h3>

          <label>Dirección:
            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} required />
          </label><br />

          <label>Colonia:
            <input type="text" name="colonia" value={formData.colonia} onChange={handleChange} required />
          </label><br />

          <label>Ciudad:
            <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} required />
          </label><br />

          <label>Estado:
            <input type="text" name="estado" value={formData.estado} onChange={handleChange} required />
          </label><br />

          <label>Código Postal:
            <input type="text" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} required />
          </label><br />

          <label>Tipo de domicilio:
            <select name="tipo_domicilio" value={formData.tipo_domicilio} onChange={handleChange}>
              <option value="personal">Personal</option>
              <option value="trabajo">Trabajo</option>
              <option value="otro">Otro</option>
            </select>
          </label><br /><br />

          <button type="submit">Agregar Domicilio</button>
        </form>
      )}
    </div>
  );
}