import Image from "next/image";

type CertificationCardProps = {
  title: string;
  issuer: string;
  description: string;
  imageSrc: string;
  issueDate?: string;
  expirationDate?: string;
  expanded: boolean;
  onToggle: () => void;
};

export default function CertificationCard({
  title,
  issuer,
  description,
  imageSrc,
  issueDate,
  expirationDate,
  expanded,
  onToggle,
}: CertificationCardProps) {
  return (
    <div className="w-full max-w-[300px] rounded-xl border border-zinc-300 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 p-4 shadow-md flex flex-col transition-all duration-300 ease-in-out">
      <div
        className="w-full relative mb-4"
        style={{ paddingBottom: "75%", position: "relative" }}
      >
        <Image
          src={imageSrc}
          alt={`${title} badge`}
          fill
          className="rounded-xl object-cover"
          style={{ position: "absolute" }}
        />
      </div>

      <h3 className="text-xl font-bold mb-4 text-center">{title}</h3>

      <button
        onClick={onToggle}
        className="px-6 py-2 text-sm font-semibold text-[#45d8ac] border border-[#45d8ac] rounded hover:bg-[#45d8ac] hover:text-white transition mb-4 cursor-pointer"
      >
        {expanded ? "Hide" : "View"}
      </button>

      <div
        className="text-center text-sm text-zinc-700 dark:text-zinc-300 space-y-2 overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{
          maxHeight: expanded ? "500px" : "0",
        }}
      >
        <p>{description}</p>
        <p className="mt-5">
          <span className="font-semibold">Issuer:</span> {issuer}
        </p>
        <p>
          <span className="font-semibold">Earned on:</span> {issueDate}
        </p>
        <p className="text-amber-700 dark:text-amber-400">
          <span className="font-semibold">Expires on:</span> {expirationDate}
        </p>
      </div>
    </div>
  );
}
