import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function NotificationsPage({ homeId, notifications, setNotifications }) {
  // const [notifications, setNotifications] = useState(initialNotifications);
  const [home, setHome] = useState(null); // valeur par défaut

  useEffect(() => {
    const fetchHome = async () => {
      if (!homeId) return;
        await fetch(`${API_URL}/home/get/${homeId}`)
          .then((res) => res.json())
          .then((data) => {
            setHome(data || null);
      });
    };

    fetchHome();
  }, []);

  console.log(home);
  

  const [selected, setSelected] = useState(null);

  const markAsRead = async(id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    try {
      const res = await fetch(`${API_URL}/notifications/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      if (!res.ok) throw new Error("Erreur serveur");
    } catch (err) {
      console.error("Erreur markAsRead:", err);
      // rollback si besoin
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: false } : n)
      );
    }
  };

  const deleteNotif = async(id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setSelected(null);

    try {
        const res = await fetch(`${API_URL}/notifications/delete/${id}`, {
          method: "DELETE"
        });

        if (!res.ok) throw new Error("Erreur serveur");
      } catch (err) {
        console.error("Erreur deleteNotif:", err);
        // rollback si besoin
        // re-fetch notifications si tu veux
      }
  };

  return (
    <div className="mt-8 flex h-[calc(85vh-80px)] bg-gray-100 md:flex-row flex-col">

      {/* 📬 LISTE */}
      <aside
        className={`
          bg-white md:w-1/3 border-r overflow-auto
          ${selected ? "hidden md:block" : "block"}
        `}
      >
        <div className="p-4 font-bold text-lg border-b sticky top-0 bg-white z-10">
          📬 Notifications
        </div>

        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={async() => {
              setSelected(notif);
              await markAsRead(notif.id);
            }}
            className={`
              px-4 py-4 border-b cursor-pointer
              active:bg-gray-100
              ${!notif.read ? "bg-softPink/20" : "bg-white  text-gray-400"}
            `}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium leading-tight">
                {notif.subject}
              </span>
              {!notif.read && (
                <span className="w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {notif.date}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="p-6 text-center text-gray-400">
            Aucune notification 📭
          </div>
        )}
      </aside>

      {/* ✉️ CONTENU */}
      <main
        className={`
          flex-1 p-4 md:p-6 overflow-auto
          ${!selected ? "hidden md:block" : "block"}
        `}
      >
        {!selected ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            Sélectionne une notification
          </div>
        ) : (
          <>
            {/* 🔙 Retour mobile */}
            <button
              onClick={() => setSelected(null)}
              className="md:hidden mb-4 text-accentGreen font-semibold flex items-center gap-2"
            >
              ← Retour
            </button>

            <div className="bg-white rounded-2xl shadow p-4 md:p-6">

              {/* Header */}
              <div className="border-b pb-3 mb-4">
                <h1 className="text-lg md:text-xl font-bold leading-tight">
                  {/* 📱 Mobile : 2 lignes */}
                  <span className="block md:hidden whitespace-pre-line text-center mb-2">
                    {selected.subject.replace(" – ", "\n")}
                  </span>

                  {/* 💻 Desktop : 1 ligne */}
                  <span className="hidden md:block whitespace-nowrap">
                    {selected.subject}
                  </span>
                </h1>
                <div className="text-xs md:text-sm text-gray-500 mt-1">
                  À : Maison {home?.name}
                  <br className="md:hidden" />
                  <span className="hidden md:inline"> . </span>
                  {"<"}{home?.email}{">"}
                </div>
              </div>

              {/* Body */}
              <div className="whitespace-pre-line text-sm md:text-base text-gray-700 mb-6">
                {selected.body}
              </div>

              {/* Lien */}
              {selected.link && (
                <a
                  href={selected.link}
                  className="inline-block mb-6 text-accentGreen font-semibold hover:underline"
                >
                  👉 Voir le détail
                </a>
              )}

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-3">
                {selected.actions?.map((action, idx) => (
                  <button
                    key={idx}
                    className={`
                      w-full md:w-auto px-4 py-3 rounded-xl font-semibold text-sm
                      ${action.type === "accept" && "bg-accentGreen text-white"}
                      ${action.type === "reject" && "bg-red-500 text-white"}
                    `}
                  >
                    {action.label}
                  </button>
                ))}

                <button
                  onClick={async() => await deleteNotif(selected.id)}
                  className="md:ml-auto text-sm text-red-500 hover:underline text-center"
                >
                  🗑 Supprimer
                </button>
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
}
