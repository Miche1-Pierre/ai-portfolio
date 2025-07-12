interface EducationItemProps {
  institution: string;
  fieldOfStudy: string;
  startDate?: string;
  endDate?: string;
}

export default function EducationItem({
  institution,
  fieldOfStudy,
  startDate,
  endDate,
}: EducationItemProps) {
  return (
    <div className="border border-zinc-300 dark:border-zinc-700 rounded-md p-4 shadow-sm">
      <h3 className="text-xl font-semibold">{institution}</h3>
      <p className="text-zinc-600 dark:text-zinc-400 italic">{fieldOfStudy}</p>
      {(startDate || endDate) && (
        <p className="text-sm text-zinc-500 dark:text-zinc-600 mt-1">
          {startDate ?? "??"} - {endDate ?? "??"}
        </p>
      )}
    </div>
  );
}
