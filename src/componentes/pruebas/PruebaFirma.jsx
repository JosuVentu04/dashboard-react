import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

export default function HmacExample() {
  const [signature, setSignature] = useState('');

  const generateSignature = () => {
    const payload = JSON.stringify({
      name: 'John',
      lastName: 'Smith'
    });
    const secretKey = 'e1d54698-b461-419a-9435-ff1c7e3e9df4';
    const hash = CryptoJS.HmacSHA256(payload, secretKey).toString(CryptoJS.enc.Hex);
    setSignature(hash);
  };

  return (
    <div>
      <button onClick={generateSignature}>Generar Firma HMAC</button>
      {signature && (
        <div>
          <h3>Firma HMAC-SHA256:</h3>
          <code>{signature}</code>
        </div>
      )}
    </div>
  );
}