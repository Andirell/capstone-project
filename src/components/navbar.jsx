"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Navs } from "@/constants/datanav";
import { useAuth } from "./auth-context";
import { ButtonLink } from "./button";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, isEmployer, logout } = useAuth();

  function closeMenu() {
    setMenuOpen(false);
  }

  // Links on the right side change depending on who is logged in
  let accountLinks = null;
  if (!loading && user) {
    accountLinks = (
      <>
        <Link href="/dashboard" onClick={closeMenu} className="font-semibold text-cream no-underline hover:text-white">
          {isEmployer ? "Employer dashboard" : "Hi, " + user.full_name.split(" ")[0]}
        </Link>
        <button onClick={logout} className="cursor-pointer text-cream/75 hover:text-white">
          Log out
        </button>
      </>
    );
  } else if (!loading) {
    accountLinks = (
      <Link href="/login" onClick={closeMenu} className="font-semibold text-cream no-underline hover:text-white">
        Log in
      </Link>
    );
  }

  let mainButton;
  if (isEmployer) {
    mainButton = <ButtonLink href="/dashboard/jobs/new" variant="light" size="sm">Post a job</ButtonLink>;
  } else if (user) {
    mainButton = <ButtonLink href="/jobs" size="sm">Find jobs</ButtonLink>;
  } else {
    mainButton = <ButtonLink href="/register?role=employer" size="sm">Post a job</ButtonLink>;
  }

  return (
    <header className="sticky top-0 z-40 bg-maroon text-cream">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link href="/" className="font-display text-3xl text-cream no-underline">
          Job<span className="text-brand">Z</span>
        </Link>

        {/* Desktop menu */}
        <nav className="hidden flex-1 md:block">
          <ul className="flex gap-7">
            {Navs.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={
                      isActive
                        ? "border-b-2 border-brand pb-1 font-semibold text-white no-underline"
                        : "text-cream/80 no-underline hover:text-white"
                    }
                  >
                    {link.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          {accountLinks}
          {mainButton}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="cursor-pointer rounded-full p-2 hover:bg-white/10 md:hidden"
        >
          {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-white/10 md:hidden">
          <ul className="container-page py-2 text-lg">
            {Navs.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={closeMenu} className="block py-3 text-cream no-underline">
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
          <div className="container-page flex items-center gap-5 border-t border-white/10 py-4">
            {accountLinks}
            <span className="ml-auto" onClick={closeMenu}>
              {mainButton}
            </span>
          </div>
        </nav>
      )}
    </header>
  );
}
