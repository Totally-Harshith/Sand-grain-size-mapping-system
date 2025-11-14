import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex h-24 w-24 items-center justify-center", className)}>
      <div className="absolute h-16 w-16 animate-spin rounded-full border-2 border-dashed border-primary opacity-75 icon-glow" />
      <div className="absolute h-24 w-24 animate-spin-slow rounded-full border-2 border-dotted border-ring opacity-50" />
      <p className="font-code text-xs text-primary tracking-widest">ANALYZING</p>
    </div>
  );
}
