"use client";

/**
 * The cold open's screen, rendered rather than photographed.
 *
 * Slide 2 asks the room to choose between two screens that are *identical* —
 * same chart, same numbers, same title — and the whole trap is that nothing
 * visible distinguishes them. Two AI renders or two real screenshots would
 * differ in a hundred incidental ways and hand the audience a tell, which is
 * the one thing this slide cannot afford. So both options render this same
 * component with the same data, and the difference between A and B is exactly
 * where the deck says it is: underneath, where the screen cannot show it.
 *
 * Jordan's churn-risk dashboard, because it is the running case.
 */

/** Fixed, not generated: both screens must be the same pixels, every render. */
const BARS = [34, 52, 41, 68, 47, 83, 61];

export function ScreenMock() {
  return (
    <div
      // One accessible name for the whole picture. The numbers inside are
      // scenery — reading seven bar heights aloud helps nobody, and the point
      // of the slide is that the picture is not what distinguishes the options.
      role="img"
      aria-label="A churn-risk dashboard"
      className="neu-inset neu-edge overflow-hidden rounded-2xl"
      style={{ background: "var(--surface)" }}
    >
      <div
        aria-hidden
        className="flex items-center gap-1.5 border-b px-3 py-2"
        style={{ borderColor: "var(--edge, rgba(128,128,128,0.18))" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--text-faint)", opacity: 0.5 }}
          />
        ))}
        <span
          className="ml-2 font-sans text-[9px] uppercase tracking-[0.16em]"
          style={{ color: "var(--text-faint)" }}
        >
          Quiet open deals
        </span>
      </div>

      {/* The numbers are the deal set's own, so the screen the room votes on is
          the screen they spend the hour building. It read "Churn risk · Q3" with
          invented figures, which was the last place the cut running case still
          appeared on a slide face. 634 quiet open deals, $79.0M of quiet open
          pipeline, 50 reps: see ../../delivery/deal-set-ground-truth.md. */}
      <div aria-hidden className="px-4 py-4">
        <div className="flex gap-6">
          {[
            ["Quiet", "634"],
            ["Value", "$79.0M"],
            ["Reps", "50"],
          ].map(([label, value]) => (
            <div key={label}>
              <p
                className="font-sans text-[8px] uppercase tracking-[0.16em]"
                style={{ color: "var(--text-faint)" }}
              >
                {label}
              </p>
              <p
                className="mt-0.5 font-display text-[1.05rem] font-semibold tabular-nums leading-none"
                style={{ color: "var(--text)" }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex h-16 items-end gap-1.5">
          {BARS.map((height, i) => (
            <span
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${height}%`,
                background: i === BARS.length - 2 ? "var(--accent)" : "var(--chart-line)",
                opacity: i === BARS.length - 2 ? 0.8 : 0.42,
              }}
            />
          ))}
        </div>

        <div className="mt-4 space-y-1.5">
          {[92, 74, 58].map((width, i) => (
            <span
              key={i}
              className="block h-1 rounded-full"
              style={{
                width: `${width}%`,
                background: "var(--text-faint)",
                opacity: 0.28,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
