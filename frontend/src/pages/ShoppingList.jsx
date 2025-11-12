import { useState, useRef } from "react";
import Header from "../components/Header";

export default function ShoppingList({ homeId }) {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFiles = (file) => {
    if (!file) {
      setStatus("Choisis une image avant d'uploader.");
      return;
    }
    setSelectedFile(file);
    setStatus(`Fichier prêt : ${file.name}`);
  };

  const handleUpload = async () => {
    const fileToUpload = selectedFile || fileInputRef.current?.files[0];
    if (!fileToUpload) {
      setStatus("Choisis une image avant d'uploader.");
      return;
    }

    console.log(fileToUpload.name);
    setStatus("Envoi en cours...");

    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("upload_preset", "Recettes");
      formData.append("public_id", fileToUpload.name.split(".")[0]); // nom sans extension

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dz4ejk7r7/image/upload",
        { method: "POST", body: formData }
      );

      const data = await res.json();
      console.log("Réponse Cloudinary :", data);

      if (data.secure_url) {
        // Transformation Cloudinary pour redimensionner à 1870×1250
        const transformedUrl = data.secure_url.replace(
          "/upload/",
          "/upload/w_1870,h_1250,c_fill/"
        );

        setStatus("✅ Image uploadée et redimensionnée avec succès !");
        setPreviewUrl(transformedUrl);
      } else {
        setStatus("❌ Erreur : pas d'URL renvoyée.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Erreur lors de l'upload : " + err.message);
    }
  };

  // Drag & Drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFiles(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8">
      <Header homeId={homeId} />
      <h1 className="text-2xl font-bold mb-4 py-8">
        Liste de courses (Test upload image de recette dans CLOUD)
      </h1>

      {/* Image Upload avec Drag & Drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current.click()}
        className={`border-2 border-dashed rounded p-4 mb-6 cursor-pointer transition ${
          dragOver ? "border-green-600 bg-green-50" : "border-gray-400"
        } relative`} // <-- relative pour que l'input absolu soit contenu
      >
        <label className="block font-semibold mb-2">Image de la recette</label>
        <p className="text-gray-500 mt-2">
          Glisse et dépose ton image ici ou clique pour choisir un fichier
        </p>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => handleFiles(e.target.files[0])}
        />
      </div>


      {/* Bouton uploader */}
      <button
        onClick={handleUpload}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Uploader
      </button>

      <p className="mt-4">{status}</p>

      {previewUrl && (
        <div className="mt-4">
          <p className="text-gray-600 mb-2">Aperçu redimensionné (1870×1250) :</p>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full border rounded shadow-md"
          />
        </div>
      )}
    </div>
  );
}
