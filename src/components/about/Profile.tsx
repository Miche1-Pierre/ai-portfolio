import React from "react";
import Badge from "@/components/Badge";
import Image from "next/image";

import { Globe } from "lucide-react";

export default function Profile() {
  return (
    <section className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-12 items-start">
      <div className="flex flex-col items-center sm:items-start gap-4 text-center sm:text-left">
        <Image
          src="/images/profile.png"
          alt="Pierre Michel"
          width={150}
          height={150}
          className="rounded-full border-2 border-white shadow-lg"
        />

        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mt-4">
          <Globe size={18} />
          <span>Metz, France</span>
        </div>

        <div className="flex gap-2 mt-2">
          <Badge>FR</Badge>
          <Badge>EN</Badge>
        </div>
      </div>
    </section>
  );
}
