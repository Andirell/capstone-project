import { APPLICATION_STATUSES } from "@/lib/constants";

const COLORS = {
  submitted: "bg-paper text-ink border-line",
  reviewing: "bg-blue-light text-blue border-blue/20",
  shortlisted: "bg-green-light text-green border-green/20",
  interview: "bg-green-light text-green border-green/20",
  offered: "bg-green text-white border-green",
  hired: "bg-green text-white border-green",
  rejected: "bg-red-light text-red border-red/20",
};

function getLabel(status) {
  const found = APPLICATION_STATUSES.find((item) => item.value === status);
  return found ? found.label : status;
}

// A colored label like "Shortlisted"
export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap ${COLORS[status]}`}>
      {getLabel(status)}
    </span>
  );
}

// The progress bar under each application: Submitted > In review > Shortlisted > Interview > Offer made
const STEPS = ["submitted", "reviewing", "shortlisted", "interview", "offered"];

export function StatusProgress({ status }) {
  // No progress bar for rejected applications
  if (status === "rejected") {
    return null;
  }

  let currentStep = STEPS.indexOf(status);
  if (status === "hired") {
    currentStep = STEPS.length - 1;
  }

  return (
    <div className="mt-3 flex gap-1">
      {STEPS.map((step, index) => (
        <div key={step} className="flex-1">
          <div className={`h-1.5 rounded-full ${index <= currentStep ? "bg-green" : "bg-line"}`} />
          <p className={`mt-1 hidden text-xs sm:block ${index === currentStep ? "font-semibold text-ink" : "text-muted"}`}>
            {getLabel(step)}
          </p>
        </div>
      ))}
    </div>
  );
}
