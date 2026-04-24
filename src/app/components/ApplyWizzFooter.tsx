"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

type ApplyWizzFooterProps = {
  style?: CSSProperties;
  logoHeight?: number;
};

export default function ApplyWizzFooter({ style, logoHeight = 32 }: ApplyWizzFooterProps) {
  return (
    <footer
      style={{
        marginTop: "24px",
        paddingTop: "16px",
        borderTop: "1px solid rgba(0,26,61,0.08)",
        display: "flex",
        justifyContent: "center",
        ...style,
      }}
    >
      <a
        href="https://www.applywizz.ai/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="ApplyWizz website"
        style={{ display: "inline-flex", alignItems: "center" }}
      >
        <Image
          src="/logo_Applywizz.png"
          alt="ApplyWizz"
          width={150}
          height={logoHeight}
          style={{ width: "auto", height: `${logoHeight}px` }}
        />
      </a>
    </footer>
  );
}
