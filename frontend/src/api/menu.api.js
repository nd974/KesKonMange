const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function checkSubscription({ menuId, profileId }) {
  const res = await fetch(`${API_URL}/menu/checkSubscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ menuId, profileId }),
  });
  const data = await res.json();
  return data.isSubscribed;
}

export async function getSubscribers(menuId) {
  const res = await fetch(
    `${API_URL}/menu/getSubscribers?menuId=${menuId}`
  );
  if (!res.ok) throw new Error("Erreur subscribers");
  return res.json();
}

export async function subscribeMenu({ menuId, profileId }) {
  const res = await fetch(`${API_URL}/menu/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ menuId, profileId }),
  });
  if (!res.ok) throw new Error("Erreur abonnement");
}

export async function unsubscribeMenu({ menuId, profileId }) {
  const res = await fetch(`${API_URL}/menu/unsubscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ menuId, profileId }),
  });
  if (!res.ok) throw new Error("Erreur désinscription");
}

export async function deleteMenu(menuId) {
  const res = await fetch(`${API_URL}/menu/delete/${menuId}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Erreur suppression");
}

export async function updateRecipeCount({ menuId, recipeId, count }) {
  await fetch(`${API_URL}/menu/update-count/${menuId}/${recipeId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count_recipe: count }),
  });
}

export async function getMenusByHome(homeId) {
  const res = await fetch(`${API_URL}/menu/get-byHome?homeId=${homeId}`);
  if (!res.ok) throw new Error("Erreur chargement menus");
  return res.json();
}
