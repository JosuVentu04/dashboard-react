import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Planes() {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const modelo = query.get("modelo");
  const precioBase = parseFloat(query.get("precioBase"));
  const score = parseFloat(query.get("score"));

  const esScoreBueno = score >= 600;
  const incrementoTres = esScoreBueno ? 0.30 : 0.35;
  const incrementoSeis = esScoreBueno ? 0.40 : 0.45;
  const incrementoNueve = esScoreBueno ? 0.50 : 0.55;

  const pagoInicialSugeridoTres = precioBase * 0.10;
  const pagoInicialSugeridoSeis = precioBase * 0.20;
  const pagoInicialSugeridoNueve = precioBase * 0.30;

  const [pagoInicial, setPagoInicial] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [mostrarCuestionario, setMostrarCuestionario] = useState(false);
  const [formaPagoInicial, setFormaPagoInicial] = useState("");
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [precioFinalSeleccionado, setPrecioFinalSeleccionado] = useState(null);

  const handlePagoInicialChange = (e) => {
    const value = parseFloat(e.target.value);

    if (isNaN(value)) {
      setPagoInicial("");
      setError("");
      return;
    }

    if (value > precioBase) {
      setError("El pago inicial no puede exceder el precio del teléfono.");
      return;
    }

    if (value > precioBase * 0.5) {
      setError("El pago inicial no puede ser mayor al 50% del precio base.");
      return;
    }

    if (value < 0) {
      setError("El pago inicial no puede ser negativo.");
      return;
    }

    setError("");
    setPagoInicial(e.target.value);
  };

  const valorPagoInicial = pagoInicial === "" ? 0 : parseFloat(pagoInicial);
  const deuda = precioBase - valorPagoInicial;

  const precioFinalTres = deuda * (1 + incrementoTres);
  const precioFinalSeis = deuda * (1 + incrementoSeis);
  const precioFinalNueve = deuda * (1 + incrementoNueve);

  const pagoSemanalTres = precioFinalTres / 13;
  const pagoSemanalSeis = precioFinalSeis / 26;
  const pagoSemanalNueve = precioFinalNueve / 39;

  const usuario = JSON.parse(localStorage.getItem("DatosUsuario"));
  const usuarioId = usuario?.clienteFiltrado?.id;

  // 🔹 Al hacer clic en cualquier plan, abre el cuestionario
  const abrirCuestionario = (planId, precioFinal) => {
    setPlanSeleccionado(planId);
    setPrecioFinalSeleccionado(precioFinal);
    setMostrarCuestionario(true);
  };

  // 🔹 Enviar contrato al backend incluyendo cuestionario
  const crearContrato = async () => {
    setMensaje("Enviando datos...");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/contratos/compra-venta/crear", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          cliente_id: usuarioId,
          plan_id: planSeleccionado,
          monto_total: precioFinalSeleccionado,
          monto_base: precioBase,
          pago_inicial: valorPagoInicial,
          forma_pago_inicial: formaPagoInicial,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear contrato");
      }

      localStorage.setItem("ContratoCreado", JSON.stringify(data.contrato));
      navigate(`/firmar-contrato/${data.contrato.id}`);

    } catch (err) {
      console.error(err);
      setError(err.message);
    }

    setMostrarCuestionario(false);
  };

  const planes = [
    { meses: 3, incremento: incrementoTres, pagoSemanal: pagoSemanalTres, precioFinal: precioFinalTres, sugerido: pagoInicialSugeridoTres, id: 1 },
    { meses: 6, incremento: incrementoSeis, pagoSemanal: pagoSemanalSeis, precioFinal: precioFinalSeis, sugerido: pagoInicialSugeridoSeis, id: 4 },
    { meses: 9, incremento: incrementoNueve, pagoSemanal: pagoSemanalNueve, precioFinal: precioFinalNueve, sugerido: pagoInicialSugeridoNueve, id: 5 }
  ];

  return (
    <div style={{ display: "flex", marginRight: "16px" }}>
      {planes.map((plan, idx) => (
        <div
          key={idx}
          style={{
            marginTop: "16px",
            padding: 24,
            maxWidth: 500,
            margin: "0 auto",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ textAlign: "center" }}>💳 Plan a {plan.meses} Meses</h2>
          <hr />

          <p><strong>Modelo:</strong> {modelo}</p>
          <p><strong>Score:</strong> {score}</p>
          <p><strong>Precio base:</strong> ${precioBase.toFixed(2)}</p>

          <label style={{ display: "block", marginBottom: "12px" }}>
            <strong>Pago inicial (modificable):</strong>
            <input
              type="number"
              value={pagoInicial}
              placeholder={plan.sugerido.toFixed(2)}
              step={100}
              onChange={handlePagoInicialChange}
              style={{ marginLeft: "8px", width: "150px" }}
            />
          </label>

          {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

          <p><strong>Incremento aplicado:</strong> {(plan.incremento * 100).toFixed(0)}%</p>

          <p style={{ fontWeight: "bold" }}>💰 Precio final: ${plan.precioFinal.toFixed(2)}</p>

          <p style={{ color: "#007bff" }}>
            Pago semanal ({Math.round(plan.meses * 4.33)} semanas aprox): ${plan.pagoSemanal.toFixed(2)}
          </p>

          <button
            onClick={() => abrirCuestionario(plan.id, plan.precioFinal)}
            className="btn-confirmar-plan"
            disabled={!!error}
          >
            Confirmar Plan
          </button>
        </div>
      ))}

      {mensaje && (
        <div style={{ marginTop: "20px", color: "green", textAlign: "center", width: "100%" }}>
          <strong>{mensaje}</strong>
        </div>
      )}

      {/* 🔹 MODAL CUESTIONARIO */}
      {mostrarCuestionario && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999
        }}>
          <div style={{
            background: "#fff",
            padding: 25,
            borderRadius: 12,
            width: "90%",
            maxWidth: 500
          }}>
            <h3>Antes de continuar</h3>

            <br />

            <label><strong>Forma de pago del pago inicial:</strong></label>
            <select value={formaPagoInicial} onChange={(e) => setFormaPagoInicial(e.target.value)}>
              <option value="">Seleccionar...</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>

            <br />

            <button 
              onClick={crearContrato}
              style={{ background: "green", color: "white", padding: "10px", borderRadius: 8 }}
            >
              Continuar y Crear Contrato
            </button>

            <button 
              onClick={() => setMostrarCuestionario(false)}
              style={{ marginLeft: 10, padding: "10px", borderRadius: 8 }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}