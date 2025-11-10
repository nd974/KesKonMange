import { NavLink, useLocation } from "react-router-dom";
import { Home, Calendar, BookOpen, ShoppingCart, Boxes } from "lucide-react";

export default function MobileNav() {
  const { pathname } = useLocation();

  const links = [
    { to: "/", icon: <Home size={22} />, label: "Dashboard" },
    { to: "/recipes", icon: <BookOpen size={22} />, label: "Recettes" },
    { to: "/calendar", icon: <Calendar size={22} />, label: "Calendrier" },
    { to: "/stock", icon: <Boxes size={22} />, label: "Stock" },
    { to: "/shopping_list", icon: <ShoppingCart size={22} />, label: "Courses" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around py-2 z-50">
      {links.map(({ to, icon, label }) => {
        const active = pathname === to;
        return (
          <NavLink
            key={to}
            to={to}
            className="flex flex-col items-center text-xs"
          >
            <div
              className={`p-2 rounded-lg ${
                active ? "text-white bg-accentGreen" : "text-gray-500"
              }`}
            >
              {icon}
            </div>
            <span className={active ? "text-accentGreen font-medium" : "text-gray-500"}>
              {label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
