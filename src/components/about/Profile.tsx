import React from "react";
import Badge from "@/components/Badge";
import Image from "next/image";
import { profile } from "@/app/const";

import { Globe } from "lucide-react";

export default function Profile() {
  return (
    <section className="flex flex-col sm:flex-row gap-12 items-center lg:items-start">
      <div className="flex flex-col items-center lg:items-start gap-4 text-center sm:text-left">
        <div className="w-[150px] h-[150px] rounded-full overflow-hidden shadow-[0_0_30px_5px_rgba(69,216,172,0.2)]">
          <Image
            src={profile.imageSrc}
            alt={profile.imageAlt}
            width={150}
            height={150}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mt-4">
          <Globe size={18} />
          <span>{profile.location}</span>
        </div>

        <div className="flex gap-2 mt-2">
          {profile.languages.map((lang, index) => (
            <Badge key={index} className="text-xs">
              {lang}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
