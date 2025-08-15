
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RegistrarModelo() {
  const { api, user } = useAuth();
  const navigate = useNavigate();

  // 🔹 Comprobación de permiso en el frontend
  if (!user || !["GERENTE", "ADMIN", "SOPORTE"].includes((user.rol || "").toUpperCase())) {
    navigate("/not-authorized");
    return null;
  }

  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    almacenamiento: "",
    anio: "",
    ram: "",
    descripcion: "",
    color: "",
    dual_sim: false,
    red_movil: "",
    version_android: "",
    procesador: "",
    velocidad_procesador: "",
    cantidad_nucleos: "",
    tamanio_pantalla: "",
    tipo_resolucion: "",
    frecuencia_actualizacion_pantalla: "",
    resolucion_camara_trasera_principal: "",
    resolucion_camara_frontal_principal: "",
    capacidad_bateria: "",
    carga_rapida: false,
    huella_dactilar: false,
    resistencia_salpicaduras: false,
    resistencia_agua: false,
    resistencia_polvo: false,
    resistencia_caidas: false,
    imagen: "",
  });

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    try {
      const { data } = await api.post("/devices/nuevo-modelo", form);
      setMsg(data.mensaje || "Modelo registrado con éxito");
      setForm({});
      // Si quieres redirigir a catálogo
      // navigate("/catalogo");
    } catch (error) {
      const backendErr = error.response?.data?.error || error.response?.data?.errores || "Error al registrar modelo";
      setErr(backendErr);
    }
  };

  return (
    <div className="container py-4">
      <h3>Registrar nuevo modelo</h3>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-danger">{err}</div>}

      <form onSubmit={submit}>
        {/* Ejemplo para los campos obligatorios */}
        <div className="mb-3">
          <label className="form-label">Marca *</label>
          <input
            name="marca"
            value={form.marca}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Modelo *</label>
          <input
            name="modelo"
            value={form.modelo}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Almacenamiento *</label>
          <input
            name="almacenamiento"
            value={form.almacenamiento}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Año *</label>
          <input
            type="number"
            name="anio"
            value={form.anio}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">RAM *</label>
          <input
            name="ram"
            value={form.ram}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        {/* Ejemplo de descripción multilinea */}
        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="form-control"
            rows="3"
          />
        </div>

        {/* Puedes seguir con el resto de campos con el mismo patrón */}
        <div className="mb-3">
          <label className="form-label">Color</label>
          <input
            name="color"
            value={form.color}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* Imagen */}
        <div className="mb-3">
          <label className="form-label">URL Imagen</label>
          <input
            name="imagen"
            value={form.imagen}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <button className="btn btn-primary" type="submit">
          Guardar modelo
        </button>
      </form>
    </div>
  );
}