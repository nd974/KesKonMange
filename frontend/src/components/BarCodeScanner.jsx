import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function BarCodeScanner({ onDetected }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [hasCamera, setHasCamera] = useState(true);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    async function startScanner() {
      try {
        // Vérifie qu'une caméra est dispo
        const devices = await codeReader.listVideoInputDevices();
        if (!devices || devices.length === 0) {
          setHasCamera(false);
          setError("Aucune caméra détectée sur cet appareil");
          return;
        }

        // Utilise la caméra arrière (si disponible)
        const backCamera = devices.find(d => d.label.toLowerCase().includes("back")) || devices[0];

        // Lance le scan continu
        codeReader.decodeFromVideoDevice(backCamera.deviceId, videoRef.current, (result, err) => {
          if (result) {
            onDetected(result.getText());
          }
        });
      } catch (err) {
        console.error(err);
        setError("Impossible d'accéder à la caméra ou au flux vidéo.");
      }
    }

    startScanner();

    // Nettoyage du flux
    return () => {
      codeReader.reset();
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [onDetected]);

  if (!hasCamera) {
    return <p style={{ color: "orange" }}>Aucune caméra disponible sur cet appareil</p>;
  }

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <video
        ref={videoRef}
        style={{ width: "100%", maxWidth: 400, border: "1px solid #ccc" }}
        autoPlay
        muted
        playsInline
      />
    </div>
  );
}
