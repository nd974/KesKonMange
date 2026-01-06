import RecipeSidebar from "./RecipeSidebar";

export default function NewRecipeDetail({ homeId,profileId}) {

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
            <div className="-ml-10 sm:-ml-20 z-10 flex flex-col justify-start sm:py-5 py-3 w-full">
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

                <div className="px-5 text-[8px] sm:px-20 sm:text-sm py-5 sm:py-10">
                    ⭐⭐⭐⭐⭐ 31 votes
                </div>
            </div>


<div className="hidden xl:flex bg-accentGreen text-black rounded-3xl mt-5 mr-5
                w-full h-auto p-6 flex-col gap-6">

  {/* TAGS */}
  <div className="flex gap-2 flex-wrap">
    {["Italien", "Pates", "Proteines animal", "Proteines animal"].slice(0, 3).map((tag) => (
      <span
        key={tag}
        className="border border-white bg-green-100 px-3 py-1 rounded-full text-xs font-semibold"
      >
        {tag}
      </span>
    ))}

    {[1, 2, 3, 4].length > 3 && (
      <div className="relative group">
        <span className="border border-white bg-gray-500 text-white px-1 py-1 rounded-full text-xs cursor-pointer font-semibold">
          +{[1, 2, 3, 4].length - 3}
        </span>

        <div className="absolute right-0 mt-2 bg-gray-800 text-white text-xs rounded px-3 py-2
                        opacity-0 group-hover:opacity-100 transition z-20">
          <div className="flex flex-col gap-1 whitespace-nowrap">
            {[1, 2, 3, 4].slice(2).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>

  {/* TABLEAU DES TEMPS */}
<div className="overflow-x-auto">
  <table className="w-full table-fixed border-[2px] border-white-500 text-black text-center">
    <thead>
      <tr>
        <th className="font-bold w-1/4 border-b-[2px] border-r-[2px]  text-white">
          Prép.
        </th>
        <th className="font-bold w-1/4 border-b-[2px] border-r-[2px]  text-white">
          Cuisson
        </th>
        <th className="font-bold w-1/4 border-b-[2px] border-r-[2px]  text-white">
          Repos
        </th>
        <th className="font-bold w-1/4 border-b-[2px] border-r-[2px]  text-white">
          Nettoy.
        </th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td className="pt-2 border-r-[1px] text-white">
          30 min
        </td>
        <td className="pt-2 border-r-[1px] text-white">
          30 min
        </td>
        <td className="pt-2 border-r-[1px] text-white">
          30 min
        </td>
        <td className="pt-2border-r-[1px] text-white">
          30 min
        </td>
      </tr>
    </tbody>
  </table>
</div>


  {/* INFOS (centrées) */}
  <div className="grid grid-cols-3 gap-6 text-sm text-center items-center">

    <div className="flex flex-col items-center gap-1">
      <span className="font-semibold">Difficulté</span>
      <span>Moyen</span>
    </div>

    <div className="flex flex-col items-center gap-1">
      <span className="font-semibold">Portions</span>
      <span>8</span>
    </div>

    <div className="flex flex-col items-center gap-2">
      <span className="font-semibold">Réalisées</span>

      <div className="flex items-center gap-2">
        <button className="bg-gray-300 w-6 h-6 rounded flex items-center justify-center">
          −
        </button>

        <span>8</span>

        <button className="bg-gray-300 w-6 h-6 rounded flex items-center justify-center">
          +
        </button>
      </div>
    </div>

  </div>
</div>


        </div>

        {/* Boutons mobile entre titre et préparation */}
        <div className="flex justify-center gap-4 py-5 lg:hidden">
            <button
                onClick={() => setOpenIngredients(true)}
                className="bg-pink-100 text-black px-4 py-2 rounded-full shadow text-sm"
            >
                🥕 Ingrédients
            </button>

            <button
                onClick={() => setOpenUstensils(true)}
                className="bg-amber-100 text-black px-4 py-2 rounded-full shadow text-sm"
            >
                🍳 Ustensiles
            </button>
        </div>

        {/* Bloc bleu */}
<div className="rounded-3xl bg-softBeige p-4 sm:-mt-16 z-10 sm:ml-40 sm:mr-4
                max-h-[50vh] overflow-hidden flex flex-col">
  
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
      <RecipeSidebar />
    </div>

    
</div>







  );
}