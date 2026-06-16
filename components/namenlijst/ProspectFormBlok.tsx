// Toont de FORM-context (Family, Occupation, Recreation, Money) die de Mentor
// over deze prospect heeft genoteerd. Puur presentatie, geen hooks.

type FormContext = {
  family?: string;
  occupation?: string;
  recreation?: string;
  money?: string;
};

export function ProspectFormBlok({
  formContext,
}: {
  formContext: FormContext | null;
}) {
  if (!formContext) return null;
  const rijen = [
    { label: "Gezin", waarde: formContext.family },
    { label: "Werk", waarde: formContext.occupation },
    { label: "Vrije tijd", waarde: formContext.recreation },
    { label: "Geld & tijd", waarde: formContext.money },
  ].filter((r) => r.waarde && r.waarde.trim());
  if (rijen.length === 0) return null;

  return (
    <div className="ml-9 rounded-xl border border-cm-border bg-cm-surface-2/40 px-4 py-3">
      <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
        🧠 Wat de Mentor over deze persoon weet
      </p>
      <div className="space-y-1">
        {rijen.map((r) => (
          <p key={r.label} className="text-sm text-cm-white/85 leading-relaxed">
            <span className="text-cm-white/55">{r.label}:</span> {r.waarde}
          </p>
        ))}
      </div>
    </div>
  );
}
