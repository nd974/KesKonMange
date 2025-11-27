
import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "../config/firebase"; // ton fichier firebase.js

export default function ShoppingList({homeId}) {


 const [token, setToken] = useState("");

  useEffect(() => {
    async function fetchToken() {
      try {
        const currentToken = await getToken(messaging, { vapidKey: "BMAEkbeNb-Tu5t7JZN1mOwXzWFbbukSwKKkY3-RgbboMw1Q5u3dlNGepXqayg2iuSbZMiOTQXk4qU6lPLv9pDuE" });
        setToken(currentToken);
      } catch (err) {
        setToken("Erreur récupération token: " + err.message);
      }
    }

    fetchToken();
  }, []);

  return <div>TOKEN = {token}</div>;
}
