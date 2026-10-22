import { BriefcaseBusiness, GraduationCap, HardHat, Laptop, Palette, Shapes, Stethoscope } from "lucide-react";

// Each category in the database has an icon name, e.g. "Laptop"
const ICONS = {
  BriefcaseBusiness: BriefcaseBusiness,
  GraduationCap: GraduationCap,
  HardHat: HardHat,
  Laptop: Laptop,
  Palette: Palette,
  Stethoscope: Stethoscope,
};

export default function CategoryIcon({ name, className }) {
  const Icon = ICONS[name] || Shapes;
  return <Icon className={className} aria-hidden="true" />;
}
