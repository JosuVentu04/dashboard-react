import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useDatosUsuario } from "../../context/DatosUsuarioContext";
import logo from '../../assets/LogoMarcel2.png';
export default function VentaCliente() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const { setDatosUsuario } = useDatosUsuario();

  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");

  async function buscarCliente(e) {
    e.preventDefault();
    setError("");

    if (!busqueda.trim()) {
      setError("Ingresa un teléfono o un código MP-XXXXX");
      return;
    }

    try {
      let response;

      if (busqueda.startsWith("MP-")) {
        response = await api.get(`/users/saldo/${busqueda}`);
      } else {
        response = await api.get(`/users/buscar?telefono=${busqueda}`);
      }

      const cliente = response.data;

      if (!cliente) {
        setError("Cliente no encontrado");
        return;
      }

      // Guardar datos del cliente globalmente
      console.log('Cliente encontrado:', cliente);
      setDatosUsuario({
  clienteId: cliente.cliente_id,
  codigoCliente: cliente.codigo,
  saldoTotal: cliente.saldo_total
});

navigate(`/venta?clienteId=${cliente.cliente_id}`);

    } catch (err) {
      console.log(err);
      setError("Cliente no encontrado");
    }
  }

  return (
    <div className="container">
      <div className="row justify-content-center">

        <div className="col-6 p-5">
          <form className="formulario-registo-usuario" onSubmit={buscarCliente}>
            <h3 className="text-center">Venta a Cliente Registrado</h3>

            <img className='logo-crear-sesion mb-3' src={logo} alt="logo" />

            <input
              type="text"
              className="form-control mb-3"
              placeholder="Teléfono o Código del cliente"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              required
            />

            {error && (
              <p className="text-danger text-center">{error}</p>
            )}

            <button className="btn-subir-sesion" type="submit">
              Buscar cliente
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}