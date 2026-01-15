import { useEffect } from "react";

/**
 * Met à jour le badge de l'application PWA avec le nombre de notifications non lues
 * @param {Array} notifications - tableau des notifications avec { read: boolean }
 */
export default function useBadge(notifications) {
  useEffect(() => {
    console.log("useBadge appelé avec notifications :", notifications);

    if (!("setAppBadge" in navigator) || !("clearAppBadge" in navigator)) {
      console.log("Badge API non supportée par ce navigateur");
      return;
    }

    const unreadCount = notifications.filter(n => !n.read).length;
    console.log("Nombre de notifications non lues :", unreadCount);

    if (unreadCount > 0) {
      navigator.setAppBadge(unreadCount).catch(err => console.error("Erreur setAppBadge:", err));
    } else {
      navigator.clearAppBadge().catch(err => console.error("Erreur clearAppBadge:", err));
    }
  }, [notifications]);
}
