const STAR_SIZE = 18; // taille uniforme

export const FullStar = ({color="yellow-500", size=1.5}) => (
  <svg
    viewBox="0 0 24 24"
    width={STAR_SIZE}
    height={STAR_SIZE}
    className={`block fill-current stroke-current text-${color}`}
    strokeWidth={size}
  >
    <path d="M12 17.3l6.18 3.7-1.64-7.03L21 9.24l-7.19-.61L12 2 10.19 8.63 3 9.24l4.46 4.73L5.82 21z" />
  </svg>
);

export const EmptyStar = ({color="yellow-500", size=1.5}) => (
  <svg
    viewBox="0 0 24 24"
    width={STAR_SIZE}
    height={STAR_SIZE}
    className={`block fill-none stroke-current text-${color}`}
    strokeWidth={size}
  >
    <path d="M12 17.3l6.18 3.7-1.64-7.03L21 9.24l-7.19-.61L12 2 10.19 8.63 3 9.24l4.46 4.73L5.82 21z" />
  </svg>
);


import { useId } from "react";
export const HalfStar = ({color="yellow-500", size=1.5}) => {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 24 24"
      width={STAR_SIZE}
      height={STAR_SIZE}
      className={`block fill-current stroke-current text-${color}`}
      strokeWidth={size}
    >
      <defs>
        <linearGradient id={gradientId}>
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        d="M12 17.3l6.18 3.7-1.64-7.03L21 9.24l-7.19-.61L12 2 10.19 8.63 3 9.24l4.46 4.73L5.82 21z"
      />
    </svg>
  );
};