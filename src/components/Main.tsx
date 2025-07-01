import React from "react";

const Main: React.FC = () => {
  return (
    <main className="overflow-hidden">
      <section className="relative bg-white text-gray-900 min-h-[90vh] flex items-center justify-center px-6">
        {/* Optional subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.03)_0%,_transparent_70%)] z-0" />

        {/* Diagonal soft green accent */}
        <div className="absolute -top-32 -left-32 w-[200%] h-[200%] bg-[#01783f] rotate-3 opacity-5 z-0" />

        {/* Main content */}
        <div className="relative z-10 text-center max-w-4xl">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="text-gacam-green">Bienvenue sur </span>
            <span className="text-[#e23b3b]">GACAM</span>
          </h1>
          <p className="text-lg sm:text-xl mb-3 text-gacam-green-dark">
            La plateforme moderne pour suivre, centraliser et sécuriser vos audits.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Main;
