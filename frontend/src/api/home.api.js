const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function loginHome({ email, password }) {
  const res = await fetch(`${API_URL}/home/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error("Email ou mot de passe incorrect");
  }

  return data;
}

export async function createHome({ email, password, name }) {
  const res = await fetch(`${API_URL}/home/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error || "Erreur création compte");
  }

  return data;
}

export async function searchAddress(query) {
  const res = await fetch(
    `${API_URL}/home/search?q=${encodeURIComponent(query)}`
  );

  if (!res.ok) {
    throw new Error("Erreur recherche adresse");
  }

  return res.json();
}
