export default function RecipeSidebar() {

  return (
    <div className="flex flex-col lg:w-1/3 gap-4">

        {/* Ingrédients */}
        <div className="rounded-3xl bg-pink-100 p-4 rounded flex flex-col">
            {/* Titre desktop */}
            <h2 className="lg:block font-bold text-lg mb-2">Ingrédients</h2>

            {/* Contenu : mobile accordéon */}
            <div
            className={`overflow-y-auto transition-all duration-300 h-[30vh]`}
            >
            <ul className="list-disc pl-5 space-y-1">
                <li>Spaghetti</li>
                <li>Œufs</li>
                <li>Pancetta</li>
                <li>Parmesan</li>
                <li>Sel & poivre</li>
                <li>Optionnel 1</li>
                <li>Optionnel 2</li>
                <li>Optionnel 3</li>
            </ul>
            </div>
        </div>

        {/* Ustensiles */}
        <div className="rounded-3xl bg-amber-100 p-4 rounded flex flex-col">
            <h2 className="hidden lg:block font-bold text-lg mb-2">Ustensiles</h2>

            <div
            className={`overflow-y-auto transition-all duration-300 h-[30vh]`}
            >
            <ul className="list-disc pl-5 space-y-1">
                <li>Casserolle</li>
                <li>Batteur</li>
                <li>Four</li>
                <li>Planche Bois</li>
                <li>Couteau</li>
                <li>Optionnel 1</li>
                <li>Optionnel 2</li>
            </ul>
            </div>
        </div>

    </div>

  );
}
