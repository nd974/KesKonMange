import ModalIngredientsList from "./ModalIngredientsList";
import ModalUstensilesList from "./ModalUstensilesList";
import ModalRecipeInfo from "./ModalRecipeInfo";
import ModalWrapper from "./ModalWrapper";
import CommentsSection from "./CommentsSection";

import { useState } from "react";

export default function NewRecipeDetail({ homeId,profileId}) {

  const [openInfos, setOpenInfos] = useState(false);
  const [openIngredients, setOpenIngredients] = useState(false);
  const [openUstensils, setOpenUstensils] = useState(false);

  const ingredients = [
    { name: "Citron", qte: 1, unit: null, qte_item: null, unit_item: null },
    { name: "Sel", qte: 50, unit: "g", qte_item: null, unit_item: null },
    { name: "Bacon", qte: 1, unit: "tranche", qte_item: 150, unit_item: "g" },
    { name: "Piments", qte: 10, unit: null, qte_item: null, unit_item: null },
    { name: "Poivre", qte: 10, unit: "g", qte_item: null, unit_item: null },
    { name: "Bacons", qte: 1, unit: "tranche", qte_item: 150, unit_item: "g" },
    { name: "Eau", qte: 10, unit: "L", qte_item: null, unit_item: null },
    { name: "Graine de sesame", qte: 1, unit: null, qte_item: null, unit_item: null },
    { name: "bloc de foie gras de canard", qte: 1, unit: "piece", qte_item: 500, unit_item: "g" },
    { name: "Poulet", qte: 1, unit: "tranche", qte_item: 1500, unit_item: "g" },
  ];

  const ustensiles = [
    "Casserolle",
    "Batteur",
    "Four",
    "Planche Bois",
    "Couteau", 
    "Ms",
    "Couteau"
  ];

  const img = "https://www.semana.com/resizer/v2/FG7F25FC45FMNE2UJVNQSZIHPE.JPG?smart=true&auth=143a54831945320e6bbc0891973a7deb60011e8ddf1d0b67fce9f3d0f3187b71&width=1280&height=720";


    const steps = [
  "Ici vous pouvez mettre toutes les informations complémentaires : temps de cuisson, difficulté, portions, astuces, conseils de présentation.",
  "2e étape de la préparation avec plus de détails utiles.",
  "3e étape expliquant la suite de la recette.",
  "4e étape importante à ne pas rater.",
  "5e étape pour finaliser la préparation.",
  "6e étape pour finaliser la préparation.",
  "7e étape pour finaliser la préparation.",
  "8e étape pour finaliser la préparation.",
  "9e étape pour finaliser la préparation.",
  "10e étape pour finaliser la préparation.",
  "11e étape pour finaliser la préparation.",
  "Dernière étape avant dégustation."
];


  return (

<div className="flex flex-col lg:flex-row gap-6 px-4 py-8 md:px-8 lg:px-16">
    {/* Bloc principal : image + titre + étoiles + détails */}
    <div className="flex flex-col w-full lg:w-2/3 gap-6">
    
        {/* Image + Titre + Étoiles */}
        <div className="flex flex-row gap-6 items-start">
            {/* Image */}
            <div className="relative shrink-0">
              <img
                  src="https://www.semana.com/resizer/v2/FG7F25FC45FMNE2UJVNQSZIHPE.JPG?smart=true&auth=143a54831945320e6bbc0891973a7deb60011e8ddf1d0b67fce9f3d0f3187b71&width=1280&height=720"
                  alt="Recette Carbonara à la cool"
                  className="w-32 h-32 sm:w-80 sm:h-80 rounded-full object-cover"
              />
            </div>

            {/* Titre + Étoiles */}
            <div className="-ml-10 sm:-ml-20 z-10 flex flex-col justify-start sm:py-5 py-3 w-full text-left">
                <h1
                    className="text-2xl sm:text-6xl font-bold leading-tight text-softPink font-display"
                    style={{
                    WebkitTextStroke: "15px white",
                    paintOrder: "stroke fill",
                    }}
                    >
                    <span>Carbonara</span>
                    <span className="block sm:py-5">à la cool</span>
                </h1>

                <div className="px-5 text-[8px] sm:px-16 sm:text-[12px] py-3 text-left">
                    ⭐⭐⭐⭐⭐ (4.75/5) 15431 votes
                </div>
                <div className="px-5 sm:px-16 text-[10px] sm:text-[12px] py-3 flex justify-between">
                  <span>Nutrition 🍏</span>
                  <span>Recette similaire ➡️</span>
                </div>
            </div>


            <div className="hidden lg:flex">
              <ModalRecipeInfo />
            </div>


        </div>

        {/* Boutons mobile entre titre et préparation */}
        <div className="flex justify-center gap-4 lg:hidden">
          <button onClick={() => setOpenInfos(true)} className="bg-accentGreen text-white px-4 py-2 rounded-full shadow text-sm">
            ℹ️ Infos
          </button>
          <button onClick={() => setOpenIngredients(true)} className="bg-pink-100 text-black px-4 py-2 rounded-full shadow text-sm">
            🥕 Ingrédients
          </button>
          <button onClick={() => setOpenUstensils(true)} className="bg-amber-100 text-black px-4 py-2 rounded-full shadow text-sm">
            🍳 Ustensiles
          </button>
        </div>

        {/* Bloc beige */}
<div className="rounded-3xl bg-softBeige p-4 sm:-mt-16 z-10 sm:ml-40 sm:mr-4
                h-[50vh] overflow-hidden flex flex-col shadow-2xl">
  
  <h2 className="text-accentGreen font-bold text-xl mb-5 shrink-0">
    Préparation
  </h2>

  {/* Conteneur scrollable */}
  <div className="overflow-y-auto space-y-4 pr-2">
    {steps.map((step, index) => (
      <div key={index} className="flex gap-4 items-center">
        {/* Numéro */}
        <span className="text-accentGreen font-bold shrink-0 sm:text-3xl text-lg">
          {index + 1}.
        </span>

        {/* Texte */}
        <p className="text-black sm:mt-2">
          {step}
        </p>
      </div>
    ))}
  </div>
  
</div>


    </div>

    {/* Séparateur vertical (desktop uniquement) */}
    <div className="hidden lg:block border-dashed border-r-8 bg-transparent border-accentGreen"></div>

{/* <div className="hidden lg:block mx-4 h-full border-r-4 border-accentGreen border-dashed"></div> */}

    {/* Sidebar */}
    <div className="hidden md:flex lg:w-1/3 w-full flex-shrink-0">
      <div className="w-full h-[83vh] flex flex-col gap-6 p-4 overflow-hidden">
        {/* Conteneur avec 2 colonnes */}
        <div className="flex flex-col lg:flex-row gap-6 w-full h-[40vh] mb-5">
          <div className="lg:flex-[55%]">
            <ModalIngredientsList ingredients={ingredients} img={img} />
          </div>
          <div className="lg:flex-[45%]">
            <ModalUstensilesList ustensiles={ustensiles} img={img} />
          </div>
        </div>

        <CommentsSection />
      </div>
    </div>

    <div className="w-full lg:hidden">
      <CommentsSection />
    </div>

    {/* --- MODALES MOBILE --- */}
    {openInfos && (
      <ModalWrapper onClose={() => setOpenInfos(false)}>
        <ModalRecipeInfo />
      </ModalWrapper>
    )}
    {openIngredients && (
      <ModalWrapper onClose={() => setOpenIngredients(false)}>
        <ModalIngredientsList ingredients={ingredients} img={img} />
      </ModalWrapper>
    )}
    {openUstensils && (
      <ModalWrapper onClose={() => setOpenUstensils(false)}>
        <ModalUstensilesList ustensiles={ustensiles} img={img} />
      </ModalWrapper>
    )}

</div>







  );
}