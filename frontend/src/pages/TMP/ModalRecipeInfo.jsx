export default function ModalRecipeInfo({ tags, times, level, portion }) {
  console.log("tags =",tags);
  console.log("times =",times);
  return (
    <div className="rounded-3xl w-full h-auto p-6 flex flex-col gap-6 sm:mt-5 shadow-2xl bg-gray-100 mr-4">
      <div className="flex gap-2 flex-wrap">
        {tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="border border-white bg-green-100 px-3 py-1 rounded-full text-xs font-semibold"
          >
            {tag.name}
          </span>
        ))}

        {tags.length > 3 && (
          <div className="relative group">
            <span className="border border-white bg-gray-400 text-white px-1 py-1 rounded-full text-xs cursor-pointer font-semibold">
              +{tags.length - 3}
            </span>

            <div className="absolute right-0 mt-2 bg-gray-800 text-white text-xs rounded px-3 py-2
                            opacity-0 group-hover:opacity-100 transition z-20">
              <div className="flex flex-col gap-1 whitespace-nowrap">
                {tags.slice(3).map((tag) => (
                  <span key={tag}>{tag.name}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TABLEAU DES TEMPS */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-[2px] border-black text-black text-center">
          <thead>
            <tr>
                <td className="pt-2 border-r-[2px] border-black">
                  Prép.
                </td>
                <td className="pt-2 border-r-[2px] border-black">
                  Cuisson
                </td>
                <td className="pt-2 border-r-[2px] border-black">
                  Repos
                </td>
                <td className="pt-2 border-r-[2px] border-black">
                  Nettoy.
                </td>
            </tr>
          </thead>

          <tbody>
            <tr>
                <td className="pt-2 border-r-[2px] border-black">
                  {times[0]}
                </td>
                <td className="pt-2 border-r-[2px] border-black">
                  {times[1]}
                </td>
                <td className="pt-2 border-r-[2px] border-black">
                  {times[2]}
                </td>
                <td className="pt-2 border-r-[2px] border-black">
                  {times[3]}
                </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* INFOS */}
      <div className="grid grid-cols-3 gap-6 text-sm text-center items-center text-black">
        <div className="flex flex-col items-center gap-1">
          <span className="font-semibold">Difficulté</span>
          <span>{["Très facile", "Facile", "Moyen", "Difficile", "Très difficile"][level]}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="font-semibold">Portions</span>
          <span>{portion}</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="font-semibold">Réalisées</span>
          <div className="flex items-center gap-2">
            <button className="bg-gray-300 w-6 h-6 rounded flex items-center justify-center bg-gray-400">−</button>
            <span>{portion}</span>
            <button className="bg-gray-300 w-6 h-6 rounded flex items-center justify-center bg-gray-500">+</button>
          </div>
        </div>
      </div>
    </div>
  );
}
