export const CLOUDINARY_NAME = `${import.meta.env.VITE_CLOUDINARY_NAME}`;

export const CLOUDINARY_RES = `https://res.cloudinary.com/${CLOUDINARY_NAME}/image/upload/`;
export const CLOUDINARY_API = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`;

export const CLOUDINARY_PRESET_LOGO = "Logos";
export const CLOUDINARY_LOGO_HOME = "v1764321172/KsKnMg_Home_qe5fbb_c2ynaz.png";
export const CLOUDINARY_LOGO_HEADER = "v1764321173/KsKnMg_ljgxhk_nndgpi.svg";
export const CLOUDINARY_LOGO_ACCOUNT = "v1767014146/KsKnMg_Account_xpwupp.svg";


export const CLOUDINARY_PRESET_AVATAR = "Avatars";
export const CLOUDINARY_AVATAR5_DEFAULT = [
    `v1764321144/avatar1_enqee6_w8lagz.png`,
    `v1764321145/avatar2_h6ubef_mwv7fb.png`,
    `v1764321145/avatar3_ibhdeb_cy1r1v.png`,
    `v1764321145/avatar4_czjb1t_rxnryd.png`,
    `v1764321145/avatar5_vmpvxy_sm0kci.png`,
];

export const CLOUDINARY_AVATARS_SETTINGS = {
  "Personnel": [
    "v1764321200/avatar_old1.png",
    "v1764321201/avatar_old2.png",
  ],

  "Classiques": [
    "v1764321144/avatar1_enqee6_w8lagz.png",
    "v1764321145/avatar2_h6ubef_mwv7fb.png",
    "v1764321145/avatar3_ibhdeb_cy1r1v.png",
    "v1764321145/avatar4_czjb1t_rxnryd.png",
    "v1764321145/avatar5_vmpvxy_sm0kci.png",
  ],

  "Stranger Things": [
    "v1764321300/eleven.png",
    "v1764321301/mike.png",
    "v1764321302/dustin.png",
  ],

    "Stranger Things2": [
    "v1764321300/eleven.png",
    "v1764321301/mike.png",
    "v1764321302/dustin.png",
  ],
    "Stranger Things3": [
    "v1764321300/eleven.png",
    "v1764321301/mike.png",
    "v1764321302/dustin.png",
  ],
    "Stranger Things4": [
    "v1764321300/eleven.png",
    "v1764321301/mike.png",
    "v1764321302/dustin.png",
  ],
    "Stranger Things5": [
    "v1764321300/eleven.png",
    "v1764321301/mike.png",
    "v1764321302/dustin.png",
  ],
    "Stranger Things6": [
    "v1764321300/eleven.png",
    "v1764321301/mike.png",
    "v1764321302/dustin.png",
  ],
    "Stranger Things7": [
    "v1764321300/eleven.png",
    "v1764321301/mike.png",
    "v1764321302/dustin.png",
  ],

};


export const CLOUDINARY_PRESET_RECIPE = "Recettes";
export const CLOUDINARY_RECETTE_NOTFOUND = "v1764321553/ImageNotFound_ktjs1j.webp";







export const Unit_Item_List = ["pièce", "tranche"];

export const Account_links = 
[
    { 
        label: "📄 Général", 
        path: "/settings", 
        items: [
            { label: "🔔 Notifications", path: "/settings" },
        ]
    },
    { 
        label: "👤 Utilisateur", 
        path: "/settings/user",
        items: []
    },
    { 
        label: "🔒 Sécurité", 
        path: "/settings/security", 
        items: [
            { label: "🔒 Mot de passe", path: "/settings/security" },
            { label: "🔢 Code PIN", path: "/settings/security" },
            { label: "📧 E-mail", path: "/settings/security" },
            { label: "📱 Téléphone mobile", path: "/settings/security" },
        ]
    },
    { 
        label: "🏠 Maisons", 
        path: "/settings/homes" 
    },
    { 
        label: "⏳ TMP STORE", 
        path: "/shops" 
    },
    { 
        label: "⏳ TMP OPENFACTFOOD", 
        path: "/openfactfood" 
    },
];