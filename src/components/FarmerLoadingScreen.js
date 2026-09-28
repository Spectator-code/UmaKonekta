'use client';

export default function FarmerLoadingScreen({ 
  message = "Loading UmaKonekta...", 
  subtext = "Philippine Agricultural Resource Exchange",
  fullScreen = true 
}) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-2 text-center px-4">
      <style jsx>{`
        .growing-plant {
          transform-origin: 50% 65%;
          animation: sprout 1.5s cubic-bezier(0.25, 1, 0.5, 1) infinite alternate;
        }

        @keyframes sprout {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          30% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .hand-soil-outline {
          stroke: #1a1a1a;
          stroke-width: 3;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .plant-outline {
          stroke: #2E8B57;
          stroke-width: 3;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
      `}</style>

      {/* Animated Sprout & Hand Loader */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 transition-transform duration-300 hover:scale-105">
        <svg 
          viewBox="0 0 100 100" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Animated Plant Sector */}
          <g className="growing-plant">
            {/* Stem */}
            <path className="plant-outline" d="M 50 65 Q 45 45 50 25" />
            {/* Left Leaf */}
            <path className="plant-outline" d="M 50 45 Q 35 45 35 30 Q 45 25 50 35" />
            {/* Right Leaf */}
            <path className="plant-outline" d="M 48 55 Q 65 55 65 40 Q 55 35 50 45" />
          </g>

          {/* Static Hand and Soil Sector */}
          {/* Dirt Mound */}
          <path className="hand-soil-outline" d="M 33 65 Q 40 53 50 53 Q 60 53 67 65" />
          <path className="hand-soil-outline" d="M 40 57 Q 45 48 55 52 Q 62 48 65 57" />

          {/* Open Palm and Fingers */}
          <path 
            className="hand-soil-outline" 
            d="M 20 55 L 30 65 Q 40 75 55 75 L 80 60 Q 85 55 80 50 L 70 60 Q 60 70 45 70 L 25 50 Z" 
          />

          {/* Wrist / Sleeve */}
          <path className="hand-soil-outline" d="M 20 55 L 10 65 L 15 75 L 25 65" />
        </svg>
      </div>

      {/* Contextual Messaging */}
      {message && (
        <div className="flex flex-col items-center mt-1">
          <p className="text-sm sm:text-base font-bold text-on-surface tracking-tight animate-pulse">
            {message}
          </p>
          {subtext && (
            <p className="text-[10px] font-mono font-medium text-soil-slate tracking-wide uppercase mt-0.5">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (!fullScreen) {
    return content;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fdfbf7] fixed inset-0 z-[9999]">
      {content}
    </div>
  );
}
