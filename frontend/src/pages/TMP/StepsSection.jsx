import { CLOUDINARY_RES, CLOUDINARY_ICONS } from "../../config/constants";

export default function StepsSection({steps}) {


  return (
    <div>

      <h2 className="text-accentGreen font-bold text-xl mb-5 shrink-0 flex items-center">
        <img
          src={`${CLOUDINARY_RES}${CLOUDINARY_ICONS["Icon_Prep"]}`}
          alt="Menu Icon"
          className="w-6 h-6 inline-block mr-2"
        />
        Préparation
      </h2>

        <div className="overflow-y-auto space-y-4 pr-2 overflow-x-hidden h-[calc(50vh-60px)] thin-scrollbar">
            {steps.map((step, index) => (
            <div key={index} className="flex gap-4 items-center  whitespace-pre-line">
                {/* Numéro */}
                <span className="text-accentGreen font-bold shrink-0 sm:text-3xl text-lg">
                {step.number}.
                </span>

                {/* Texte */}
                <p className="text-black sm:mt-2">
                {step.description}
                </p>
            </div>
            ))}
        </div>
    </div>


  );
}
