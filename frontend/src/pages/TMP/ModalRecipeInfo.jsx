import { FullStar, HalfStar, EmptyStar } from "../../components/Stars";

export default function ModalRecipeInfo({ tags, times, level, portion, usage_count, averageNote, votesCount, modal=false}) {
  console.log("asdssssssssssssssssssssssssssssssssssssssssss", usage_count);

  const formatNumber = (num) => {
    if (num === null || num === undefined) return "";
    const n = Number(num); // convertit en nombre
    if (isNaN(n)) return ""; // si ce n'est pas un nombre, retourne vide
    return n % 1 === 0 ? n : parseFloat(n.toFixed(2)); // entier → 6, décimal → 6.5
  };

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h${m}`;
  };

  return (
    <div className="rounded-3xl w-full h-auto p-4 flex flex-col gap-6 shadow-2xl bg-gray-100 mr-4">
      {modal && (<h2 className="font-bold text-lg mb-2">Informations</h2>)}
      <div className="flex items-center justify-between w-full flex-wrap gap-2">
        {/* Bloc tags + +N */}
        
        <div className="flex flex-wrap gap-2 items-center">
          {tags.length === 0 && (
            <span
              className="border border-white bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold"
            >
              Aucun tag
            </span>
          )}
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag.name}
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
                    <span key={tag.name}>{tag.name}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Flèche à droite */}
        <span className="text-xl">➡️</span>
      </div>


      {/* TABLEAU DES TEMPS */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Score / votes */}
        {votesCount > 0 && (
          <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
            <p className="font-bold text-yellow-500 flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }, (_, i) => {
                const starNum = i + 1;

                if (starNum <= Math.floor(averageNote)) return <FullStar key={i} />;
                if (starNum - 1 < averageNote && averageNote < starNum) return <HalfStar key={i} />;
                return <EmptyStar key={i} />;
              })}
            </p>
            <p className="text-sm">
              ({formatNumber(averageNote)} / 5) • {votesCount} vote{votesCount > 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* Tableau des temps */}
        <div
          className={`border-2 border-black text-black text-center w-full ${
            votesCount > 0 ? "md:flex-[2]" : "md:flex-1"
          }`}
        >
          <table className="w-full table-fixed">
            <tbody>
              <tr className="border-b-2 border-black">
                <td className="py-2 border-r-2 border-black">
                  Prép : {formatTime(times[0])}
                </td>
                <td className="py-2">
                  Cuis. : {formatTime(times[1])}
                </td>
              </tr>
              <tr>
                <td className="py-2 border-r-2 border-black">
                  Rep. : {formatTime(times[2])}
                </td>
                <td className="py-2">
                  Net. : {formatTime(times[3])}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
            <span>{usage_count}</span>
            <button className="bg-gray-300 w-6 h-6 rounded flex items-center justify-center bg-gray-500">+</button>
          </div>
        </div>
      </div>
    </div>
  );
}
