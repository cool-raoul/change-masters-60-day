import Link from "next/link";
import Image from "next/image";

export default function WelkomPagina() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between px-6 py-12">

      {/* Logo + naam */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <img src="/eleva-icon.png" alt="ELEVA" className="w-24 h-24 rounded-2xl" />
        <h1 className="text-4xl font-bold text-[#D4AF37] tracking-widest">ELEVA</h1>
        <p className="text-white/50 text-sm tracking-wider uppercase">60 Dagen Run Systeem</p>
      </div>

      {/* Welkomst tekst */}
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="w-16 h-px bg-[#D4AF37]/30" />
        <h2 className="text-2xl font-semibold text-white leading-snug">
          Welkom bij het team van<br />
          <span className="text-[#D4AF37]">Raoul & Gaby</span>
        </h2>
        <p className="text-white/60 text-sm leading-relaxed">
          Je bent uitgenodigd voor de 60-dagenrun.
          Maak je account aan en installeer de app op je telefoon.
        </p>
        <div className="w-16 h-px bg-[#D4AF37]/30" />
      </div>

      {/* Knoppen */}
      <div className="flex flex-col gap-4 w-full max-w-sm">

        {/* Installeer instructie */}
        <div className="bg-white/5 border border-[#D4AF37]/20 rounded-xl p-4 text-center">
          <p className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-2">
            📱 Installeer de app
          </p>
          <p className="text-white/50 text-xs leading-relaxed">
            Tik op het deel-icoontje in Safari en kies<br />
            <span className="text-white/80">"Zet op beginscherm"</span>
          </p>
        </div>

        {/* Start knop */}
        <Link
          href="/registreer"
          className="w-full bg-[#D4AF37] text-black font-bold text-lg py-4 rounded-xl text-center hover:bg-[#c9a030] transition-colors"
        >
          Maak je account aan →
        </Link>

        {/* Al account */}
        <Link
          href="/login"
          className="w-full text-center text-white/40 text-sm hover:text-white/70 transition-colors py-2"
        >
          Heb je al een account? Log in
        </Link>
      </div>

    </div>
  );
}
