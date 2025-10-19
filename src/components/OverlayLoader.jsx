import React from "react";

export default function OverlayLoader({ mensaje = "Cargando..." }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center 
                    bg-black/60 backdrop-blur-sm z-50 transition-all duration-300">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        <p className="text-white text-sm font-medium tracking-wide">
          {mensaje}
        </p>
      </div>
    </div>
  );
}
