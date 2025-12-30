import React from "react";

export default function Notifications({ notifications, setNotifications, onClose }) {
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev =>
      prev.filter(n => n.id !== id)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold text-lg">🔔 Notifications</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* Contenu */}
        <div className="max-h-80 overflow-auto">

          {/* Non lues */}
          {unreadNotifications.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-red-500">Non lues</div>
              {unreadNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="px-4 py-3 border-b flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="whitespace-pre-line">{notif.text}</span>
                  <button
                    className="text-xs text-accentGreen hover:underline"
                    onClick={() => markAsRead(notif.id)}
                  >
                    ✔ Marquer comme lue
                  </button>
                </div>
              ))}
            </>
          )}

          {/* Lues */}
          {readNotifications.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400">Lues</div>
              {readNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="px-4 py-3 border-b flex items-center justify-between text-gray-400 hover:bg-gray-50"
                >
                  <span className="whitespace-pre-line">{notif.text}</span>
                  <button
                    className="text-xs text-red-500 hover:underline"
                    onClick={() => deleteNotification(notif.id)}
                  >
                    🗑 Supprimer
                  </button>
                </div>
              ))}
            </>
          )}

          {notifications.length === 0 && (
            <div className="px-4 py-6 text-center text-gray-400">Aucune notification 📭</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <button
            className={`text-sm hover:underline ${
              readNotifications.length === 0
                ? "text-gray-300 cursor-not-allowed"
                : "text-red-500"
            }`}
            disabled={readNotifications.length === 0}
            onClick={() => {
              setNotifications(prev => prev.filter(n => !n.read));
            }}
          >
            🗑 Supprimer les notifications lues
          </button>

          <button
            className={`text-sm hover:underline ${
              unreadNotifications.length === 0
                ? "text-gray-300 cursor-not-allowed"
                : "text-sm text-accentGreen hover:underline"
            }`}
            disabled={unreadNotifications.length === 0}
            onClick={() => {
              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }}
          >
            Tout marquer comme lu
          </button>
        </div>

      </div>
    </div>
  );
}
