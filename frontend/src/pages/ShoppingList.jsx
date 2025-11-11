import { useState, useRef } from "react";
import Header from "../components/Header";
import { CLOUDINARY_API, CLOUDINARY_PRESET_RECIPE } from "../config/constants";

export default function ShoppingList({homeId}) {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const resizeImageToExact = (file, width, height) => {
    return new Promise((resolve, reject) => {
      if (!file) return reject("Aucun fichier fourni");

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = width;   // largeur exacte
          canvas.height = height; // hauteur exacte
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height); // déformation possible

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const resizedFile = new File([blob], "image-resized.jpg", { type: "image/jpeg" });
                resolve(resizedFile);
              } else {
                reject("Erreur lors de la conversion en Blob");
              }
            },
            "image/jpeg",
            0.9
          );
        };

        img.onerror = () => reject("Erreur lors du chargement de l'image");
      };

      reader.onerror = () => reject("Erreur lors de la lecture du fichier");
    });
  };

  const handleUpload = async () => {
    const originalFile = fileInputRef.current?.files[0];
    if (!originalFile) {
      setStatus("Choisis une image avant d'uploader.");
      return;
    }

    setStatus("Redimensionnement en cours...");

    try {
      const resizedFile = await resizeImageToExact(originalFile, 1870, 1250);

      setStatus("Envoi en cours...");

      const formData = new FormData();
      formData.append("file", resizedFile);
      formData.append("upload_preset", CLOUDINARY_PRESET_RECIPE);

      const res = await fetch(`${CLOUDINARY_API}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Réponse Cloudinary :", data);

      if (data.secure_url) {
        setStatus("✅ Image uploadée avec succès !");
        setPreviewUrl(data.secure_url); // cette image sera exactement 1870x1250
      } else {
        setStatus("❌ Erreur : pas d'URL renvoyée.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Erreur lors de l'upload : " + err);
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8">
      <Header homeId={homeId}/>
      <h1 className="text-2xl font-bold mb-4 py-8">Liste de courses (Test upload image de recette dans CLOUD)</h1>

      <input type="file" ref={fileInputRef} accept="image/*" className="block mb-4" />
      <button
        onClick={handleUpload}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Uploader
      </button>

      <p className="mt-4">{status}</p>

      {previewUrl && <img src={previewUrl} alt="Preview" className="mt-4 max-w-full" />}
    </div>
  );
}
