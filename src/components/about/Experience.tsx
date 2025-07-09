import Image from "next/image";

interface WorkExperienceItemProps {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
}

export default function WorkExperienceItem({
  company,
  role,
  startDate,
  endDate,
  description,
  imageSrc,
  imageAlt,
}: WorkExperienceItemProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
      {imageSrc && (
        <div className="sm:w-1/3 flex-shrink-0">
          <Image
            src={imageSrc}
            alt={imageAlt || company}
            width={200}
            height={150}
            className="rounded-md object-cover"
          />
        </div>
      )}

      <div className="sm:w-2/3 flex flex-col justify-between">
        <h3 className="text-2xl font-semibold text-[#45d8ac]">{company}</h3>
        <p className="font-medium text-zinc-700 dark:text-zinc-300">
          {role} &nbsp;•&nbsp;{" "}
          <span className="italic">
            {startDate} - {endDate || "Present"}
          </span>
        </p>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
