// Dashboard pages are private, so we tell search engines not to list them
export const metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default function DashboardLayout({ children }) {
  return children;
}
