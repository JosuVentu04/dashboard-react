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
  const [mensaje, setMensaje] = useState(""); // 🔹 NUEVO

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

  // 🔹 NUEVA FUNCIÓN: Enviar contrato al backend
  const crearContrato = async (planId, precioFinal) => {
  setMensaje("Enviando datos...");
  setError("");

  try {
    console.log("Usuario ID:", usuarioId);

    const response = await fetch("http://localhost:5000/api/contratos/compra-venta/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cliente_id: usuarioId,
        plan_id: planId,
        monto_total: precioFinal,
        monto_base: precioBase,
        pago_inicial: valorPagoInicial
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al crear contrato");
    }

    // Guardar contrato en localStorage
    localStorage.setItem("ContratoCreado", JSON.stringify(data.contrato));

    // Redirigir a la página de firma del contrato
    navigate(`/firmar-contrato/${data.contrato.id}`);

  } catch (err) {
    console.error(err);
    setError(err.message);
    setMensaje("");
  }
};

  // 🔹 FUNCIONES para cada plan
  const confirmarPlanTres = () => crearContrato(1, precioFinalTres);
  const confirmarPlanSeis = () => crearContrato(4, precioFinalSeis);
  const confirmarPlanNueve = () => crearContrato(5, precioFinalNueve);

  return (
    <div style={{ display: "flex", marginRight: "16px" }}>
      {[ 
        { meses: 3, incremento: incrementoTres, pagoSemanal: pagoSemanalTres, precioFinal: precioFinalTres, sugerido: pagoInicialSugeridoTres, confirmar: confirmarPlanTres },
        { meses: 6, incremento: incrementoSeis, pagoSemanal: pagoSemanalSeis, precioFinal: precioFinalSeis, sugerido: pagoInicialSugeridoSeis, confirmar: confirmarPlanSeis },
        { meses: 9, incremento: incrementoNueve, pagoSemanal: pagoSemanalNueve, precioFinal: precioFinalNueve, sugerido: pagoInicialSugeridoNueve, confirmar: confirmarPlanNueve }
      ].map((plan, idx) => (
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

          <p><strong>Modelo:</strong> 

{modelo}</p>

          <p><strong>Score:</strong> 

{score}</p>

          <p><strong>Precio base:</strong> $

{precioBase.toFixed(2)}</p>

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

          <p><strong>Incremento aplicado:</strong> 

{(plan.incremento * 100).toFixed(0)}%</p>

          <p style={{ fontWeight: "bold" }}>💰 Precio final: ${plan.precioFinal.toFixed(2)}</p>

          <p style={{ color: "#007bff" }}>
  Pago semanal ({Math.round(plan.meses * 4.33)} semanas aprox): $

{plan.pagoSemanal.toFixed(2)}
</p>

          <button
            onClick={plan.confirmar}
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
    </div>
  );
}