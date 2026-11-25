// A control label with a long form (wide stage) and a short one (phone: the stage is ~52vh tall).

export function Lbl({ long, short }: { long: string; short: string }) {
  return (
    <>
      <span className="l6-long">{long}</span>
      <span className="l6-short">{short}</span>
    </>
  );
}
