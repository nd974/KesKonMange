export default function SecurityItem({ icon, label, value, verified }) {
  return (
    <div className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
      
      {/* Texte */}
      <div className="flex flex-col justify-center">
        <span className="font-medium">{icon} {label}</span>

        {value && (
          <span className="text-sm text-gray-700">{value}</span>
        )}

        {value && !verified && (
          <span className="text-sm text-red-500 flex items-center gap-1">
            ⛔ Vérification requise
          </span>
        )}
      </div>

      {/* Chevron */}
      <span className="text-xl">›</span>
    </div>
  );
}
