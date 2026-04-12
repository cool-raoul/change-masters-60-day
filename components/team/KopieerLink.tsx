"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function KopieerLink({ userId }: { userId: string }) {
  const [link, setLink] = useState("");

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
          toast.success("Link gekopieerd!");
        }}
        className="btn-secondary text-sm px-4"
      >
        Kopieer
      </button>
    </div>
  );
}
