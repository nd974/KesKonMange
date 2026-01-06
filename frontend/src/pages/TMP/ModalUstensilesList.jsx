// UstensilesList.jsx
export default function ModalUstensilesList({ ustensiles, img }) {
  return (
    <div className="rounded-3xl p-4 flex flex-col overflow-hidden shadow-lg bg-gray-100">
      <h2 className="font-bold text-lg mb-2">Ustensiles</h2>
      <div className="overflow-y-auto h-[calc(40vh-40px)] thin-scrollbar">
        <div className="grid grid-cols-2 gap-4 justify-items-center">
          {ustensiles.map((ustensil, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center justify-center text-center"
            >
              <img 
                src={img}
                alt={ustensil} 
                className="w-10 h-10 object-cover" 
              />
              <span>{ustensil}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
