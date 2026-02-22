export const CLOUDINARY_NAME = `${import.meta.env.VITE_CLOUDINARY_NAME}`;

export const CLOUDINARY_RES = `https://res.cloudinary.com/${CLOUDINARY_NAME}/image/upload/`;
export const CLOUDINARY_API = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`;

export const CLOUDINARY_PRESET_LOGO = "Logos";
export const CLOUDINARY_LOGO_HOME = "v1764321172/KsKnMg_Home_qe5fbb_c2ynaz.png";
export const CLOUDINARY_LOGO_HEADER = "v1764321173/KsKnMg_ljgxhk_nndgpi.svg";
export const CLOUDINARY_LOGO_ACCOUNT = "v1771774640/Logo_account_ik6d7r.webp";


export const CLOUDINARY_PRESET_AVATAR = "Avatars";
export const CLOUDINARY_AVATAR5_DEFAULT = [
        "v1764321144/avatar1_enqee6_w8lagz.png",
        "v1764321145/avatar2_h6ubef_mwv7fb.png",
        "v1764321145/avatar3_ibhdeb_cy1r1v.png",
        "v1764321145/avatar4_czjb1t_rxnryd.png",
        "v1771092103/avatar_vert_nfxsxn.webp",
        "v1771582311/avatar6_violet_blbdtn.webp",
        "v1771582311/avatar7_orange_tb61rk.webp",
];

export const CLOUDINARY_AVATARS_SETTINGS = {
    "Upload": [],

    "Classiques": [
        "v1764321144/avatar1_enqee6_w8lagz.png",
        "v1764321145/avatar2_h6ubef_mwv7fb.png",
        "v1764321145/avatar3_ibhdeb_cy1r1v.png",
        "v1764321145/avatar4_czjb1t_rxnryd.png",
        "v1771092103/avatar_vert_nfxsxn.webp",
        "v1771582311/avatar6_violet_blbdtn.webp",
        "v1771582311/avatar7_orange_tb61rk.webp",
    ],

    "Fruits": [
        "v1770988112/abricot_urmvkl.webp",
        "v1770988215/banane_tm24e1.webp",
        "v1770988469/fraise_r9nwtu.webp",
        "v1771092310/Pasteque_tabi8h.webp",
        "v1771092365/Pomme_femgwy.webp",
        "v1771768554/Mangue_jozvrt.webp",
        "v1771323769/avatar_raisin_hgrkjb.webp",
        "v1771354507/Ananas_ls0ket.webp",
        "v1771353317/Poire_oq4uxg.webp",
        "v1771354243/Kiwi_r7hgxq.webp",
        "v1771354361/Cerise_sa847q.webp",

        "v1770988586/framboise_on22c2.webp",
    ],

    "Légumes": [
        "v1771769682/carotte_iwv2bu.webp",
    ],

    "Viande": [
        "v1771584177/avatar_poulet_ddsb6h.webp",
        "v1771584353/avatar_boeuf_jubomh.webp",
        "v1771769090/porc_ribs_wgvtuf.webp",
        "v1771769174/Magret_Canard_lu7gyb.webp",
    ],
};


export const CLOUDINARY_PRESET_RECIPE = "Recettes";
export const CLOUDINARY_RECETTE_NOTFOUND = "v1764321553/ImageNotFound_ktjs1j.webp";


export const CLOUDINARY_ICONS = {
    "Icon_Menu": "v1767538472/icon_menu_sgphlk.webp",
    "Icon_Prep" : "v1767797817/Prep_fzvxwv.webp",
    "Icon_Ing" :"v1769275864/icon_ing_uuymbc.webp"
};




export const Unit_Item_List = ["pièce", "tranche"];

export const Account_links = 
[
    { 
        label: "📄 Général", 
        path: "/settings", 
        items: [
            { label: "🔔 Notifications", path: "/settings" },
            { label: "🌍 Langue & région", path: "/settings/language" },
            { label: "⏰ Fuseau horaire", path: "/settings/timezone" },
            { label: "📅 Semaine alimentaire", path: "/settings/week" },
            { label: "🎯 Objectifs alimentaires", path: "/settings/goals" },
        ]
    },
    { 
        label: "👤 Utilisateur", 
        path: "/settings/user",
        items: [
            { label: "🥗 Préférences alimentaires", path: "/settings/user/preferences" },
            { label: "🚫 Allergies & exclusions", path: "/settings/user/allergies" },
            { label: "💸 Budget personnel", path: "/settings/user/budget" },
            { label: "📊 Statistiques personnelles", path: "/settings/user/stats" },
        ]
    },
    { 
        label: "🔒 Sécurité", 
        path: "/settings/security", 
        items: [
            { label: "🔒 Mot de passe", path: "/settings/security" },
            { label: "🔢 Code PIN", path: "/settings/security" },
            { label: "📧 E-mail", path: "/settings/security" },
            { label: "📱 Téléphone mobile", path: "/settings/security" },
            { label: "🛡️ Appareils connectés", path: "/settings/security" },
        ]
    },
    { 
        label: "🏠 Maisons", 
        path: "/settings/homes" 
    },
];