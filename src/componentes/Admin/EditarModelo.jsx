import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

export default function EditarModelo() {
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({});
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // 🔹 Control de acceso por rol
  useEffect(() => {
    if (!user || !["ADMIN", "SOPORTE"].includes((user.rol || "").toUpperCase())) {
      navigate("/not-authorized");
    }
  }, [user, navigate]);

  // 🔹 Función para convertir strings a booleanos reales o null
  const parseBool = (val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return null; // para opción vacía
  };

  // 🔹 Cargar datos existentes
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await api.get(`/devices/catalogo-modelos/${id}`);
        setForm(data);
      } catch (error) {
        console.error(error);
        setErr("No se pudo cargar el modelo");
      }
    })();
  }, [id, api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Si el campo es booleano, convierte
    const booleanFields = [
      "dual_sim",
      "carga_rapida",
      "huella_dactilar",
      "resistencia_salpicaduras",
      "resistencia_agua",
      "resistencia_polvo",
      "resistencia_caidas"
    ];
    setForm({
      ...form,
      [name]: booleanFields.includes(name) ? parseBool(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      const { data } = await api.put(`/devices/editar-modelo/${id}`, form);
      setMsg(data.mensaje || "Modelo actualizado correctamente");
    } catch (error) {
      console.error(error);
      const backendErr =
        error.response?.data?.error ||
        error.response?.data?.errores ||
        "Error al actualizar modelo";
      setErr(backendErr);
    }
  };

  return (
    <div className="container py-4">
      <h3>Editar modelo</h3>
      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-danger">{err}</div>}

      <form onSubmit={handleSubmit}>
        {/* Campos de texto / número */}
        {[
          "marca","modelo","almacenamiento","anio","ram","descripcion","imagen","color",
          "red_movil","version_android","procesador","velocidad_procesador","cantidad_nucleos",
          "tamanio_pantalla","tipo_resolucion","frecuencia_actualizacion_pantalla",
          "resolucion_camara_trasera_principal","resolucion_camara_frontal_principal",
          "capacidad_bateria", "precio"
        ].map((field) => (
          <div className="mb-2" key={field}>
            <label className="form-label">{field.replaceAll("_", " ")}</label>
            <input
              type="text"
              name={field}
              value={form[field] || ""}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        ))}

        {/* Campos booleanos */}
        {[
          "dual_sim","carga_rapida","huella_dactilar",
          "resistencia_salpicaduras","resistencia_agua",
          "resistencia_polvo","resistencia_caidas"
        ].map((field) => (
          <div className="mb-2" key={field}>
            <label className="form-label">{field.replaceAll("_", " ")}</label>
            <select
              name={field}
              value={form[field] === null || form[field] === undefined ? "" : form[field]}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Seleccione</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
        ))}

        <button className="btn btn-primary" type="submit">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}