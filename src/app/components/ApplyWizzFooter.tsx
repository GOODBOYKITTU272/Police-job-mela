"use client";

import Image from "next/image";

export const APPLYWIZZ_WEBSITE_URL = "https://www.applywizz.ai/";

export function ApplyWizzFooter() {
  return (
    <footer className="applywizz-footer" aria-label="ApplyWizz">
      <a
        href={APPLYWIZZ_WEBSITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="applywizz-footer-link"
      >
        <Image
          src="/logo_Applywizz.png"
          alt="ApplyWizz"
          width={160}
          height={48}
          className="applywizz-footer-logo"
        />
      </a>
    </footer>
  );
}
