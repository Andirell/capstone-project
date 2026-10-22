// Shows the company's logo, or its initials in a colored square if it has no logo.

const COLORS = [
  { background: "#fde9e3", text: "#a5341f" },
  { background: "#f3e6d6", text: "#7a4a1c" },
  { background: "#e8ece0", text: "#47592a" },
  { background: "#e4eef7", text: "#285f8f" },
  { background: "#efe4f1", text: "#6b3576" },
  { background: "#f6e8c9", text: "#7b5a10" },
];

const SIZES = {
  sm: "size-9 rounded-lg text-xs",
  md: "size-12 rounded-xl text-sm",
  lg: "size-16 rounded-2xl text-xl",
};

export default function CompanyLogo({ company, size = "md" }) {
  if (company.logo_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={company.logo_url} alt="" className={`${SIZES[size]} shrink-0 border border-line bg-white object-contain p-1`} />;
  }

  // "Insight Analytics" -> "IA", "TechNova" -> "TE"
  const words = company.name.split(" ");
  let initials = words[0].slice(0, 2);
  if (words.length > 1) {
    initials = words[0][0] + words[1][0];
  }

  // Pick the same color for the same company every time
  const color = COLORS[company.name.length % COLORS.length];

  return (
    <span
      aria-hidden="true"
      className={`${SIZES[size]} inline-flex shrink-0 items-center justify-center font-semibold`}
      style={{ backgroundColor: color.background, color: color.text }}
    >
      {initials.toUpperCase()}
    </span>
  );
}
