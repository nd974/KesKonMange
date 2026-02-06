const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function getProfilesByHome(homeId) {
  const res = await fetch(`${API_URL}/home/get-profiles?homeId=${homeId}`);
  if (!res.ok) throw new Error("Erreur chargement profils");
  return res.json();
}

export async function createProfileApi({ homeId, username, password, name, avatar, roleId }) {
  const res = await fetch(`${API_URL}/profile/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ home_id: homeId, username, password, name, avatar, role_id: roleId }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Erreur création profil");
  return data;
}

export async function transferProfileApi({ homeId, username, password }) {
  const res = await fetch(`${API_URL}/profile/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ home_id: homeId, username, password }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Erreur transfert profil");
  return data;
}

export async function updateProfilePinApi({ profileId, pin }) {
  const res = await fetch(`${API_URL}/profile/update-pin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profileId,
      pin, // string "000974" ou null pour suppression
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "Erreur mise à jour du code PIN");
  }
  return data;
}