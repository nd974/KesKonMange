import RecipeSidebar from "./RecipeSidebar";

export default function NewRecipeDetail({ homeId,profileId}) {

  return (

<div className="flex flex-col lg:flex-row gap-6px-4 py-8 md:px-8 lg:px-16">
    {/* Bloc principal : image + titre + étoiles + détails */}
    <div className="flex flex-col w-full lg:w-2/3 gap-6">
    
        {/* Image + Titre + Étoiles */}
        <div className="flex flex-row gap-6">
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

                <div className="px-5 text-[8px] sm:px-20 sm:text-lg py-5 sm:py-10">
                    ⭐⭐⭐⭐⭐ 125 votes
                </div>
            </div>
        </div>

        {/* Boutons mobile entre titre et préparation */}
        <div className="flex justify-center gap-4 py-5 lg:hidden">
            <button
                onClick={() => setOpenIngredients(true)}
                className="bg-softPink text-white px-4 py-2 rounded-full shadow text-sm"
            >
                🥕 Ingrédients
            </button>

            <button
                onClick={() => setOpenUstensils(true)}
                className="bg-softPink text-white px-4 py-2 rounded-full shadow text-sm"
            >
                🍳 Ustensiles
            </button>
        </div>

        {/* Bloc bleu */}
        <div className="rounded-3xl bg-blue-500 text-white p-4 sm:-mt-20 z-10 sm:ml-40 sm:mr-4">
            <h2 className="font-bold text-lg mb-2">Preparation</h2>
            <p>
                Ici vous pouvez mettre toutes les informations complémentaires : temps de cuisson,
                difficulté, portions, astuces, conseils de présentation, ou tout autre détail important.
            </p>
        </div>
    </div>
    <RecipeSidebar />
</div>







  );
}