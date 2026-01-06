import { CLOUDINARY_RES } from "../../config/constants";

export default function CommentsSection() {
  // Exemple de commentaires
  const comments = [
    {
      avatar: `https://randomuser.me/api/portraits/men/1.jpg`,
      name: "Alex",
      date: "06/01/2026",
      description: 
        "Super recette, facile à suivre et délicieuse ! \n Merci."
    },
    {
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      name: "Sophie",
      date: "05/01/2026",
      description: "J'ai ajouté un peu plus de sel et c'était parfait."
    },
    {
      avatar: "https://randomuser.me/api/portraits/men/76.jpg",
      name: "Julien",
      date: "04/01/2026",
      description: "Merci pour la recette ! J'ai réussi du premier coup."
    },
        {
      avatar: "https://randomuser.me/api/portraits/men/76.jpg",
      name: "Julien",
      date: "04/01/2026",
      description: "Merci pour la recette ! J'ai réussi du premier coup."
    },
      {
      avatar: "https://randomuser.me/api/portraits/men/76.jpg",
      name: "Julien",
      date: "04/01/2026",
      description: "Merci pour la recette ! J'ai réussi du premier coup."
    },
  ];

  return (
    <div className="rounded-3xl p-4 flex flex-col overflow-hidden h-full shadow-lg bg-gray-100">
        {/* Titre + bouton */}
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Commentaires</h2>
            <button className="bg-softPink text-white px-4 py-1 rounded-full text-sm hover:bg-pink-200 transition">
            Laisser un avis
            </button>
        </div>

        {/* Liste des commentaires */}
        <div className="overflow-y-auto max-h-[30vh] space-y-4 thin-scrollbar">
            {comments.map((comment, index) => (
            <div key={index} className="flex gap-4">
                {/* Avatar */}
                <img
                src={comment.avatar}
                alt={comment.name}
                className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
                />

                {/* Texte du commentaire */}
                <div className="flex flex-col w-full">
                {/* Nom à gauche, date à droite */}
                <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-sm">{comment.name}</span>
                    <span className="text-xs text-gray-500 mr-2">{comment.date}</span>
                </div>

                {/* Description du commentaire */}
                <p className="text-sm text-black whitespace-pre-line mr-1">{comment.description}</p>
                </div>
            </div>
            ))}
        </div>
        </div>

  );
}
