import Link from "next/link";

// All my buttons share these styles. Pick a color with "variant" and a size with "size".

const baseStyle =
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  primary: "bg-brand-dark text-white hover:bg-brand-darker",
  dark: "bg-maroon text-cream hover:bg-maroon-light",
  outline: "border border-line bg-white text-ink hover:border-maroon/40",
  light: "bg-cream text-maroon hover:bg-white",
  ghost: "text-ink hover:bg-maroon/5",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5",
  lg: "h-13 px-7",
};

function getClasses(variant, size, className) {
  return `${baseStyle} ${variants[variant]} ${sizes[size]} ${className || ""}`;
}

// A normal <button>
export function Button({ variant = "primary", size = "md", className, children, ...props }) {
  return (
    <button className={getClasses(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

// A link that looks like a button
export function ButtonLink({ href, variant = "primary", size = "md", className, children }) {
  return (
    <Link href={href} className={getClasses(variant, size, className)}>
      {children}
    </Link>
  );
}
