export default function ActionButton({
  icon,
  label,
  color = "accentGreen",
  href,
  onClick,
}) {
  const Component = href ? "a" : "button";

  const colorClassMap = {
    accentGreen:
      "bg-accentGreen text-white hover:shadow-lg hover:scale-105",
    softBeige:
      "bg-softBeige text-gray-700 border border-gray-300 hover:bg-white",
    danger:
      "bg-red-500 text-white hover:bg-red-600",
    outline:
      "border border-gray-400 text-gray-700 hover:bg-gray-100",
  };

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-2
        px-4 py-1
        rounded-full
        font-semibold
        text-sm
        shadow-md
        transition
        cursor-pointer
        ${colorClassMap[color]}
      `}
    >
        <span className="flex items-center justify-center gap-2 w-full text-center">
        {icon && <span className="text-xl">{icon}</span>}
        {label}
        </span>
    </Component>
  );
}
