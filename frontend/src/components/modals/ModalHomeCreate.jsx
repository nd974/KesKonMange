import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { useCreateHome } from "../../hooks/useHome";
import { useAddressSearch } from "../../hooks/useHome";

export default function ModalHomeCreate({ onClose, onCreated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [message, setMessage] = useState("");

  const [address, setAddress] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const createMutation = useCreateHome();

  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(address);
    }, 300);

    return () => clearTimeout(timer);
  }, [address]);

  const {
    data: suggestions = [],
    isFetching,
  } = useAddressSearch(debouncedQuery);

  
  const handleCreateHome = () => {
    setMessage("");

    createMutation.mutate(
      { email, password, name },
      {
        onSuccess: () => {
          setMessage("✅ Compte créé !");
          onCreated?.();
          onClose?.();
        },
        onError: (err) => {
          setMessage("❌ " + err.message);
        },
      }
    );
  };

  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    return (
      emailRegex.test(email) &&
      passwordRegex.test(password) &&
      name.length > 0 &&
      name.length < 50 &&
      isAddressValid
    );
  };


  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordIsValid =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
  const nameIsValid = name.length > 0 && name.length < 50;

  const inputClass = (isValid, value) =>
  `w-full rounded px-3 py-2 border-2 ${
    value.length === 0
      ? "border-gray-300"
      : isValid
      ? "border-accentGreen"
      : "border-softPink"
  }`;


  const emailError =
    email.length > 0 && !emailIsValid
      ? "Email invalide (ex: nom@domaine.com)"
      : "";

  const passwordError =
    password.length > 0 && !passwordIsValid
      ? "8 caractères min, majuscule, minuscule, chiffre et caractère spécial"
      : "";

  const nameError =
    name.length > 0 && !nameIsValid
      ? "Le nom doit contenir entre 1 et 50 caractères"
      : "";

  const addressError =
    address.length > 0 && !isAddressValid
      ? "Veuillez sélectionner une adresse dans la liste"
      : "";



  return (
    <ModalWrapper onClose={onClose}>
      <h2
        className="text-xl font-semibold mb-4 text-center"
        style={{ color: "#6b926f" }}
      >
        Créer une nouvelle maison
      </h2>

      {message && <p className="text-center mb-3">{message}</p>}

      <div className="flex flex-col gap-4 text-black">

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="font-medium">Email :</label>
          <input
            className={inputClass(emailIsValid, email)}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && (
            <p className="text-sm text-red-500 mt-1">{emailError}</p>
          )}
        </div>

        {/* Mot de passe */}
        <div className="flex flex-col gap-1">
          <label className="font-medium">Mot de passe :</label>
          <input
            type="password"
            className={inputClass(passwordIsValid, password)}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordError && (
            <p className="text-sm text-red-500 mt-1">{passwordError}</p>
          )}
        </div>

        {/* Nom de la maison */}
        <div className="flex flex-col gap-1">
          <label className="font-medium">Nom du foyer familiale:</label>
          <input
            className={inputClass(nameIsValid, name)}
            placeholder="Nom du foyer familiale"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {nameError && (
            <p className="text-sm text-red-500 mt-1">{nameError}</p>
          )}
        </div>

        {/* Adresse */}
        <div className="flex flex-col gap-1 relative">
          <label className="font-medium">Adresse :</label>
          <input
            className={inputClass(isAddressValid, address)}
            placeholder="Adresse"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setShowSuggestions(true);
              setIsAddressValid(false);
            }}
          />
          {addressError && (
            <p className="text-sm text-red-500 mt-1">{addressError}</p>
          )}

{/* 
          {isFetching && (
            <div className="text-sm text-gray-500 mt-1">
              Recherche de l’adresse…
            </div>
          )} */}

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 max-h-40 overflow-auto border border-gray-200 rounded bg-white text-black mt-1">
              {suggestions.map((item) => (
                <div
                  key={item.place_id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setAddress(item.display_name);
                    setShowSuggestions(false);
                    setIsAddressValid(true);
                  }}
                >
                  {item.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bouton */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleCreateHome}
            disabled={createMutation.isLoading || !isFormValid()}
            className={`px-4 py-2 rounded ${
              !createMutation.isLoading && isFormValid()
                ? "bg-green-200 text-green-900 hover:bg-green-300"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            } transition`}
          >
            {createMutation.isLoading ? "Création..." : "Créer"}
          </button>

        </div>
      </div>
    </ModalWrapper>
  );
}
