import AvatarRow from "../AvatarRow";
import { CLOUDINARY_AVATARS_SETTINGS } from "../../config/constants";
import { useState, useEffect } from "react";
import ModalWrapper from "./ModalWrapper";

export default function ModalPickAvatar({
  isOpen,
  onClose,
  selectedAvatar,
  onSelectAvatar,
  profileId,
}) {

  const [avatarSettings, setAvatarSettings] = useState({});

  useEffect(() => {
    setAvatarSettings(CLOUDINARY_AVATARS_SETTINGS);
  }, []);
  

  if (!isOpen) return null;



  return (
    
      <ModalWrapper isOpen={isOpen} onClose={onClose}>

        <h2
          className="text-xl font-semibold mb-4 text-center"
          style={{ color: "#6b926f" }}
        >
          Choisissez une icône de profil
        </h2>

        {/* Contenu */}
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {Object.entries(avatarSettings).map(
            ([category, avatars]) => (
              <AvatarRow
                key={category}
                title={category}
                avatars={avatars}
                selectedAvatar={selectedAvatar}
                profileId={profileId}
                onSelect={async (avatar) => {
                    await onSelectAvatar(avatar);
                    onClose();
                }}
              />
            )
          )}
        </div>
        </ModalWrapper>
  );
}
