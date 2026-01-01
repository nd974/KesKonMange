export default function SettingsActionItem({
  icon,
  title,
  descriptions = [],
  href,
  onClick,
  rightIcon = "›",
}) {
  const Component = href ? "a" : "div";

    const iconClassMap = {
    "⛔": "text-red-600",
    "⚠️": "text-yellow-600",
    "✅": "text-green-600",
    "ℹ️": "text-blue-600",
    };

  return (
    <Component
      href={href}
      onClick={onClick}
      className="px-6 py-5 flex justify-between items-center cursor-pointer hover:bg-gray-50"
    >
      <div className="flex items-start gap-4 justify-between items-center">
        {icon && <span className="text-xl">{icon}</span>}

        <div>
          <p className="font-medium">{title}</p>

            {descriptions.map((text, index) => {
            const colorClass = iconClassMap[text[0]] || "text-gray-600";

            return (
                <p
                key={index}
                className={`text-sm ${colorClass}`}
                >
                {text}
                </p>
            );
            })}

        </div>
      </div>

      <span className="text-xl">{rightIcon}</span>
    </Component>
  );
}
