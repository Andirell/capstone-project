import { DM_Serif_Text, Instrument_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { AuthProvider } from "@/components/auth-context";

// Font for headings
const dmSerifText = DM_Serif_Text({
  variable: "--font-dmserif",
  weight: ["400"],
  subsets: ["latin"],
});

// Font for everything else
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "JobZ - Find jobs in Nigeria",
    template: "%s | JobZ", // e.g. "Browse jobs | JobZ"
  },
  description: "Search jobs across Lagos, Abuja, Port Harcourt and remote. Apply in minutes and track every application.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSerifText.variable} ${instrumentSans.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
