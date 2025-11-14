import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <h1
      className={cn(
        "text-3xl font-bold text-primary tracking-wider font-headline select-none",
        "bg-clip-text text-transparent bg-gradient-to-br from-primary to-accent",
        "drop-shadow-[0_0_8px_hsl(var(--primary))]",
        className
      )}
    >
      PixelGrain Analyzer
    </h1>
  );
}
