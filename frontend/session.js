// utils/session.js
import { openDB } from "idb";

const DB_NAME = "KesKonMangeSession";
const STORE_NAME = "session";
const KEY_HOME_ID = "home_id";
const DB_VERSION = 1;

async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

// Sauvegarde home_id
export async function setHomeId(homeId) {
  try {
    const db = await getDb();
    const id = parseInt(homeId, 10);
    if (isNaN(id)) throw new Error(`homeId invalide : ${homeId}`);
    await db.put(STORE_NAME, id, KEY_HOME_ID);
    console.log("home_id sauvegardé :", id);
  } catch (err) {
    console.error("Erreur setHomeId:", err);
  }
}

// Lecture home_id
export async function getHomeId() {
  try {
    const db = await getDb();
    return await db.get(STORE_NAME, KEY_HOME_ID);
  } catch (err) {
    console.error("Erreur getHomeId:", err);
    return null;
  }
}

// Suppression home_id
export async function clearHomeId() {
  try {
    const db = await getDb();
    await db.delete(STORE_NAME, KEY_HOME_ID);
    console.log("home_id supprimé !");
  } catch (err) {
    console.error("Erreur clearHomeId:", err);
  }
}

// 🔹 Fonction pour "rafraîchir" le home_id sans le supprimer
export async function refreshHomeId() {
  try {
    const db = await getDb();
    const homeId = await db.get(STORE_NAME, KEY_HOME_ID);
    console.log("home_id rafraîchi :", homeId);
    return homeId; // retourne la valeur actuelle
  } catch (err) {
    console.error("Erreur refreshHomeId:", err);
    return null;
  }
}
