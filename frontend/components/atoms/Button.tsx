
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "light" | "danger" | "secondary" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500",
  light: "bg-white text-zinc-950 hover:bg-zinc-200",
  danger: "bg-rose-600 text-white hover:bg-rose-500",
  secondary: "border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
  ghost: "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
};

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    />
  );
}
