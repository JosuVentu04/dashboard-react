import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function CapturaPage() {
  const [sessionId, setSessionId] = useState(null);
  const [step, setStep] = useState(0);
  const [fotos, setFotos] = useState({ cara: null, idFrontal: null, idTrasera: null });
  const [mensaje, setMensaje] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  let stream;

  const navigate = useNavigate();

  // Leer parámetros de URL
  const params = new URLSearchParams(window.location.search);
  const sId = params.get('sessionId');
  const clienteExistente = params.get('clienteExistente') === 'true';
  const clienteId = params.get('clienteId');

  // -------------------------------------------
  // INICIO CÁMARA
  // -------------------------------------------
  useEffect(() => {
    setSessionId(sId);

    async function iniciarCamara() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMensaje('La cámara no es compatible con este navegador.');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        setMensaje('Error al acceder a la cámara: ' + err.message);
      }
    }

    iniciarCamara();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [sId]);

  // -------------------------------------------
  // TOMAR FOTO
  // -------------------------------------------
  function tomarFoto() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgData = canvas.toDataURL('image/jpeg');
    const nuevasFotos = { ...fotos };

    if (clienteExistente) {
      nuevasFotos.cara = imgData;
      setFotos(nuevasFotos);
      setStep(1);
      setMensaje('Selfie lista para enviar');
      return;
    }

    if (step === 0) nuevasFotos.cara = imgData;
    else if (step === 1) nuevasFotos.idFrontal = imgData;
    else if (step === 2) nuevasFotos.idTrasera = imgData;

    setFotos(nuevasFotos);

    if (step < 2) setStep(step + 1);
    else {
      setStep(3);
      setMensaje('Fotos listas para enviar');
    }
  }

  // -------------------------------------------
  // SUBIR FOTO A VERIFF
  // -------------------------------------------
  async function subirFoto(tipo, base64Image) {
    if (!sessionId) throw new Error('sessionId no definido');

    const endpoints = {
      selfie: `${API_URL}/api/veriff/upload/selfie/${sessionId}`,
      front: `${API_URL}/api/veriff/upload/front/${sessionId}`,
      back: `${API_URL}/api/veriff/upload/back/${sessionId}`
    };

    const res = await fetch(endpoints[tipo], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error subiendo foto');
    }
  }

  // -------------------------------------------
  // ENVIAR SESIÓN A VERIFF
  // -------------------------------------------
  async function enviarSesion() {
    if (!sessionId) throw new Error('sessionId no definido');

    const res = await fetch(`${API_URL}/api/veriff/submit-session/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error enviando sesión');
    }
  }

  // -------------------------------------------
  // OBTENER INE DESDE BD (CLIENTE EXISTENTE)
  // -------------------------------------------
  async function obtenerDocumentosCliente(clienteId) {
    const res = await fetch(`${API_URL}/users/${clienteId}/identity-documents`);

    if (!res.ok) throw new Error("No se pudieron obtener los documentos del cliente");

    const docs = await res.json();

    const doc = docs[0];
    if (!doc) throw new Error("El cliente no tiene documentos guardados");
    if (!doc.front_image_base64 || !doc.back_image_base64)
      throw new Error("Documentos del cliente incompletos");

    return {
      frontal: doc.front_image_base64,
      trasera: doc.back_image_base64
    };
  }

  // -------------------------------------------
  // ENVIAR FOTOS (CLIENTE NUEVO O EXISTENTE)
  // -------------------------------------------
  async function enviarFotos() {
    setSubiendo(true);
    setMensaje("");

    try {
      // -------- CLIENTE EXISTENTE --------
      if (clienteExistente) {
        const docs = await obtenerDocumentosCliente(clienteId);

        await subirFoto("selfie", fotos.cara);
        await subirFoto("front", docs.frontal);
        await subirFoto("back", docs.trasera);

      } else {
        // -------- CLIENTE NUEVO --------
        await subirFoto("selfie", fotos.cara);
        await subirFoto("front", fotos.idFrontal);
        await subirFoto("back", fotos.idTrasera);
      }

      await enviarSesion();

      setEnviado(true);
      setMensaje("✅ Fotos y sesión enviadas correctamente");

      navigate(`/resumen?clienteId=${clienteId}`);

    } catch (err) {
      console.error(err);
      setMensaje("❌ " + err.message);
    } finally {
      setSubiendo(false);
    }
  }

  // -------------------------------------------
  // UI
  // -------------------------------------------
  return (
    <div style={{ maxWidth: 480, margin: 'auto', padding: 16, textAlign: 'center' }}>
      <h2>Verificación de Identidad</h2>

      <p>
        {clienteExistente
          ? "Toma una selfie para verificar identidad"
          : step === 0
          ? "Foto 1: Selfie"
          : step === 1
          ? "Foto 2: ID frontal"
          : step === 2
          ? "Foto 3: ID trasera"
          : "¡Fotos listas!"}
      </p>

      {!enviado ? (
        <>
          <video ref={videoRef} style={{ width: '100%', borderRadius: 8 }} autoPlay muted playsInline />
          
          <button
            onClick={tomarFoto}
            disabled={subiendo}
            style={{ marginTop: 12, padding: '12px 20px', fontSize: 16 }}
          >
            {clienteExistente ? "Tomar selfie" : step <= 2 ? "Tomar foto" : "Fotos tomadas"}
          </button>

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Cliente nuevo: mostrar preview */}
          {!clienteExistente && step > 2 && (
            <div style={{ marginTop: 20 }}>
              <div>
                <img src={fotos.cara} alt="Selfie" style={{ width: 100, marginRight: 8 }} />
                <img src={fotos.idFrontal} alt="ID frontal" style={{ width: 100, marginRight: 8 }} />
                <img src={fotos.idTrasera} alt="ID trasera" style={{ width: 100 }} />
              </div>

              <button
                onClick={enviarFotos}
                disabled={subiendo}
                style={{ marginTop: 16, padding: '12px 25px', fontSize: 16 }}
              >
                {subiendo ? "Enviando..." : "Enviar Fotos y Sesión"}
              </button>
            </div>
          )}

          {/* Cliente existente: botón directo */}
          {clienteExistente && step === 1 && (
            <div style={{ marginTop: 20 }}>
              <button
                onClick={enviarFotos}
                disabled={subiendo}
                style={{ marginTop: 16, padding: '12px 25px', fontSize: 16 }}
              >
                {subiendo ? "Enviando..." : "Enviar Selfie"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ marginTop: 40 }}>
          <h3>¡Fotos enviadas correctamente!</h3>
        </div>
      )}

      {mensaje && <p style={{ marginTop: 15, color: 'red' }}>{mensaje}</p>}
    </div>
  );
}