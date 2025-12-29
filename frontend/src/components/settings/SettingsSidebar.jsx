import { useNavigate, useLocation } from "react-router-dom";
import { Account_links } from "../../config/constants";

export default function SidebarAccount() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 hidden md:block">
      <button
        className="flex items-center gap-2 text-sm text-gray-600 mb-6 hover:underline"
        onClick={() => navigate("/")}
      >
        ← Retour sur KesKonMange
      </button>

      <nav className="space-y-4 text-sm">
        {Account_links.map((link) => {
          const isActive = location.pathname === link.path;

          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`flex items-center gap-3 w-full text-left transition
                ${
                  isActive
                    ? "font-semibold text-black"
                    : "text-gray-600 hover:text-black"
                }
              `}
            >
              {link.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
