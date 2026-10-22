// Lists used in dropdowns and filters.
// The "value" must match what the Django API uses.

export const WORK_MODES = [
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

export const JOB_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

export const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry level" },
  { value: "mid", label: "Mid level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead / Manager" },
];

export const SORT_OPTIONS = [
  { value: "", label: "Most relevant" },
  { value: "-created_at", label: "Newest first" },
  { value: "-salary_max", label: "Highest salary" },
  { value: "salary_min", label: "Lowest salary" },
];

export const SALARY_OPTIONS = [
  { value: "", label: "Any salary" },
  { value: "3000", label: "$3,000+" },
  { value: "5000", label: "$5,000+" },
  { value: "8000", label: "$8,000+" },
  { value: "12000", label: "$12,000+" },
];

export const APPLICATION_STATUSES = [
  { value: "submitted", label: "Submitted" },
  { value: "reviewing", label: "In review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "offered", label: "Offer made" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Not selected" },
];

export const CONTACT = {
  email: "JobZonline1@gmail.com",
  phone: "+234 905 747 9783",
  phoneLink: "tel:+2349057479783",
  address: "Ajamgbadi Mountain Rd., Ikefun, Lagos 10123, Nigeria",
};
