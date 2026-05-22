// File: components/anti-overwhelm/MentorCuratorVoorstel.tsx
//
// K5 van anti-overwhelm-kompas: Mentor-curator-acties zijn altijd voorstel +
// akkoord, nooit stille acties. Component toont voorstel in chat-stijl met
// twee knoppen (akkoord / niet nu).

"use client";

export type CuratorVoorstelProps = {
  voorstel: string;
  redenering?: string;
  opAkkoord: () => void;
  opNietNu: () => void;
};

export function MentorCuratorVoorstel({
  voorstel,
  redenering,
  opAkkoord,
  opNietNu,
}: CuratorVoorstelProps) {
  return (
    <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4">
      <div className="mb-2 flex items-start gap-2">
        <span className="text-base">🧭</span>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wider text-violet-300">
            Voorstel van de Mentor
          </div>
          <div className="mt-1 text-sm text-slate-100">{voorstel}</div>
          {redenering && (
            <div className="mt-2 text-xs text-slate-400">{redenering}</div>
          )}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={opAkkoord}
          className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-violet-50 hover:bg-violet-500"
        >
          Akkoord
        </button>
        <button
          type="button"
          onClick={opNietNu}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
        >
          Niet nu
        </button>
      </div>
    </div>
  );
}
