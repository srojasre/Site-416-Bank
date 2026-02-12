import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const isCentered = align === "center";

  return (
    <div className={cn("space-y-3", isCentered && "text-center")}>
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-zinc-700/70 bg-zinc-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-zinc-400",
          isCentered && "mx-auto"
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-red-500/80" />
        {eyebrow}
      </div>
      <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-base text-zinc-400",
            isCentered && "mx-auto"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
