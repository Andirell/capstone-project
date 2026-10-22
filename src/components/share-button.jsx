"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

// Opens the phone's share menu, or copies the link on a computer
export default function ShareButton({ title }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({ title: title, url: url }).catch(() => {});
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-white px-4 font-semibold hover:border-maroon/40"
    >
      <Share2 className="size-5" />
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
