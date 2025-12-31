import AvatarRow from "./AvatarRow";
import { CLOUDINARY_AVATARS_SETTINGS } from "../config/constants";

export default function ModalPickAvatar({
  isOpen,
  onClose,
  selectedAvatar,
  onSelectAvatar,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center z-[9999]">
      
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg w-full max-w-4xl p-6 z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Choisissez une icône de profil
          </h2>

          <button
            onClick={onClose}
            className="text-xl"
          >
            ✕
          </button>
        </div>

        {/* Contenu */}
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {Object.entries(CLOUDINARY_AVATARS_SETTINGS).map(
            ([category, avatars]) => (
              <AvatarRow
                key={category}
                title={category}
                avatars={avatars}
                selectedAvatar={selectedAvatar}
                onSelect={(avatar) => {
                  onSelectAvatar(avatar);
                  onClose();
                }}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
