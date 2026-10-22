const CURRENCY_SYMBOLS = { USD: "$", NGN: "₦" };

function formatMoney(amount, currency) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency + " ";
  return symbol + amount.toLocaleString("en-US");
}

// Example: "$6,000 – $10,000"
export function formatSalary(job) {
  const currency = job.salary_currency || "USD";

  if (job.salary_min && job.salary_max) {
    return formatMoney(job.salary_min, currency) + " – " + formatMoney(job.salary_max, currency);
  }
  if (job.salary_min) {
    return "From " + formatMoney(job.salary_min, currency);
  }
  if (job.salary_max) {
    return "Up to " + formatMoney(job.salary_max, currency);
  }
  return "";
}

// Example: "12 Mar 2026"
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Example: "Today", "Yesterday", "3 days ago", "2 weeks ago"
export function timeAgo(dateString) {
  const oneDay = 24 * 60 * 60 * 1000;
  const days = Math.floor((Date.now() - new Date(dateString).getTime()) / oneDay);

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return days + " days ago";
  if (days < 14) return "1 week ago";
  if (days < 30) return Math.floor(days / 7) + " weeks ago";
  return formatDate(dateString);
}

// Example: plural(1, "job") -> "1 job", plural(5, "job") -> "5 jobs"
export function plural(count, word) {
  return count + " " + (count === 1 ? word : word + "s");
}
