import { Link, useLocation, useNavigate  } from "react-router-dom";

import Header from "../Header";

import { Account_links } from "../../config/constants";

export default function HeaderAccount({ homeId }) {
  const navigate = useNavigate();
  const location = useLocation();


  return (
    <div className="bg-white sticky top-0 z-[9999] py-8 px-4 md:px-8 lg:px-16">
      <Header homeId={homeId} inAccount={true} />

      {/* Navigation mobile */}
      <div className="md:hidden border-b bg-white mt-6">
        <div className="flex gap-6 overflow-x-scroll" style={{scrollbarWidth: "none", msOverflowStyle: "none",}}>

          {Account_links.map((tab) => {
            const isActive = location.pathname === tab.path;

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`relative py-4 text-sm whitespace-nowrap font-medium
                  ${isActive ? "text-black" : "text-gray-500 hover:text-black"}
                `}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute left-0 bottom-0 w-full h-[3px] bg-accentGreen rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

