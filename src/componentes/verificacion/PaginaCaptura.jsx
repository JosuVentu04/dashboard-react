import React, { useRef, useState, useEffect } from 'react';

export default function CapturaPage() {
  const [sessionId, setSessionId] = useState(null);
  const [step, setStep] = useState(0); // 0: selfie, 1: ID frontal, 2: ID trasera, 3: listo
  const [fotos, setFotos] = useState({ cara: null, idFrontal: null, idTrasera: null });
  const [mensaje, setMensaje] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const sId = params.get('sessionId');
  setSessionId(sId);

  async function iniciarCamara() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setMensaje('La API getUserMedia no está soportada en este navegador.');
    console.error('API getUserMedia no soportada');
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  } catch (err) {
    setMensaje('Error al acceder a la cámara: ' + err.message);
    console.error(err);
  }
}

  iniciarCamara();

  return () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };
}, []);

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
    if (step === 0) nuevasFotos.cara = imgData;
    else if (step === 1) nuevasFotos.idFrontal = imgData;
    else if (step === 2) nuevasFotos.idTrasera = imgData;
    setFotos(nuevasFotos);
    if (step < 2) setStep(step + 1);
    else setMensaje('Fotos listas para enviar');
  }

  async function enviarFotos() {
    setSubiendo(true);
    setMensaje('');
    try {
      const response = await fetch('/api/veriff/upload-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          photos: fotos,
        }),
      });
      if (!response.ok) throw new Error('Error subiendo fotos');
      setMensaje('Fotos enviadas correctamente');
      setStep(0);
      setFotos({ cara: null, idFrontal: null, idTrasera: null });
    } catch (error) {
      setMensaje('Error al enviar fotos: ' + error.message);
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: 'auto', padding: 16, textAlign: 'center' }}>
      <h2>Verificación de Identidad</h2>
      <p>Por favor, sigue los pasos para tomar las fotos necesarias.</p>

      <p>
        {step === 0 && 'Foto 1: Selfie (tu cara)'}
        {step === 1 && 'Foto 2: Parte frontal de tu ID'}
        {step === 2 && 'Foto 3: Parte trasera de tu ID'}
        {step > 2 && '¡Fotos listas!'}
      </p>

      <video ref={videoRef} style={{ width: '100%', borderRadius: 8 }} autoPlay muted playsInline />

      <button
        onClick={tomarFoto}
        disabled={subiendo || step > 2}
        style={{ marginTop: 12, padding: '12px 20px', fontSize: 16 }}
      >
        {step <= 2 ? 'Tomar foto' : 'Fotos tomadas'}
      </button>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {step > 2 && (
        <div style={{ marginTop: 20 }}>
          <div>
            <img src={fotos.cara} alt="Selfie" style={{ width: 120, marginRight: 8 }} />
            <img src={fotos.idFrontal} alt="ID frontal" style={{ width: 120, marginRight: 8 }} />
            <img src={fotos.idTrasera} alt="ID trasera" style={{ width: 120 }} />
          </div>
          <button
            onClick={enviarFotos}
            disabled={subiendo}
            style={{ marginTop: 16, padding: '12px 25px', fontSize: 16 }}
          >
            {subiendo ? 'Enviando...' : 'Enviar Fotos'}
          </button>
        </div>
      )}
      {mensaje && <p style={{ marginTop: 15, color: subiendo ? 'gray' : 'red' }}>{mensaje}</p>}
    </div>
  );
}