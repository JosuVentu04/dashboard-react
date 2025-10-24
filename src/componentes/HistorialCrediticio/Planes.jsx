import { useLocation } from "react-router-dom";
import { useState } from "react";

export default function Planes() {
  const query = new URLSearchParams(useLocation().search);
  const modelo = query.get("modelo");
  const precioBase = parseFloat(query.get("precioBase"));
  const score = parseFloat(query.get("score"));

  const esScoreBueno = score >= 600;
  const incremento = esScoreBueno ? 0.40 : 0.45;

  const pagoInicialSugerido = precioBase * 0.10;
  const [pagoInicial, setPagoInicial] = useState("");
  const [error, setError] = useState("");

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
  const precioFinal = (precioBase - valorPagoInicial) * (1 + incremento);
  const pagoSemanal = precioFinal / 12;

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 500,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center" }}>💳 Plan a 3 Meses</h2>
      <hr />
      <p><strong>Modelo:</strong> {modelo}</p>
      <p><strong>Score:</strong> {score}</p>
      <p><strong>Precio base:</strong> ${precioBase.toFixed(2)}</p>

      <label style={{ display: "block", marginBottom: "12px" }}>
        <strong>Pago inicial (modificable):</strong>
        <input
          type="number"
          value={pagoInicial}
          placeholder={pagoInicialSugerido.toFixed(2)}
          step={100}
          onChange={handlePagoInicialChange}
          style={{ marginLeft: '8px', width: '150px' }}
        />
      </label>

      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      <p><strong>Incremento aplicado:</strong> {(incremento * 100).toFixed(0)}%</p>
      <p style={{ fontWeight: "bold" }}>💰 Precio final: ${precioFinal.toFixed(2)}</p>
      <p style={{ color: "#007bff" }}>Pago semanal (12 semanas): ${pagoSemanal.toFixed(2)}</p>

      <button
        onClick={() => alert("Plan confirmado")}
        style={{
          marginTop: "16px",
          width: "100%",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          padding: "10px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
        disabled={!!error}
      >
        Confirmar Plan
      </button>
    </div>
  );
}