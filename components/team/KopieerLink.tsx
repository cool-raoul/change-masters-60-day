"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTaal } from "@/lib/i18n/TaalContext";

export default function KopieerLink({ userId }: { userId: string }) {
  const [link, setLink] = useState("");
  const { v } = useTaal();

  const getLink = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/registreer?team=${userId}`;
    }
    return "";
  };

  return (
    <div className="flex gap-2">
      <input
        readOnly
        value={getLink()}
        className="input-cm text-sm flex-1"
        onFocus={(e) => e.target.select()}
      />
      <button
        onClick={() => {
          navigator.clipboard.writeText(getLink());
          toast.success(v("link.gekopieerd"));
        }}
        className="btn-secondary text-sm px-4"
      >
        {v("link.kopieer")}
      </button>
    </div>
  );
}
