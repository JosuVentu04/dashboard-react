import { useLocation } from "react-router-dom";

export default function Planes() {
  const query = new URLSearchParams(useLocation().search);
  const modelo = query.get("modelo");
  const precioBase = parseFloat(query.get("precioBase"));
  const score = parseFloat(query.get("score"));

  const esScoreBueno = score >= 600; // umbral configurable
  const incremento = esScoreBueno ? 0.40 : 0.45;
  const precioFinal = precioBase * (1 + incremento);
  const pagoMensual = precioFinal / 3;

  return (
    <div style={{
      padding: 24,
      maxWidth: 500,
      margin: "0 auto",
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ textAlign: "center" }}>💳 Plan a 3 Meses</h2>
      <hr />
      <p><strong>Modelo:</strong> {modelo}</p>
      <p><strong>Score:</strong> {score}</p>
      <p><strong>Precio base:</strong> ${precioBase.toFixed(2)}</p>
      <p><strong>Incremento aplicado:</strong> {(incremento * 100).toFixed(0)}%</p>
      <p style={{ fontWeight: "bold" }}>💰 Precio final: ${precioFinal.toFixed(2)}</p>
      <p style={{ color: "#007bff" }}>Pago mensual (3 meses): ${pagoMensual.toFixed(2)}</p>

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
          cursor: "pointer"
        }}
      >
        Confirmar Plan
      </button>
    </div>
  );
}