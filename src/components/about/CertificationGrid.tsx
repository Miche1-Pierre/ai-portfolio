import { useState } from "react";
import CertificationCard from "./CertificationCard";

type Certification = {
  title: string;
  issuer: string;
  description: string;
  imageSrc: string;
  issueDate: string;
  expirationDate?: string;
};

interface CertificationGridProps {
  certifications: Certification[];
}

export default function CertificationGrid({ certifications }: CertificationGridProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section className="w-full">
      <h2 className="text-3xl font-bold mb-8">Certifications</h2>
      <div
        className="grid gap-8 items-start"
        style={{ gridTemplateColumns: "repeat(auto-fit, 300px)" }}
      >
        {certifications.map((cert, idx) => (
          <CertificationCard
            key={idx}
            title={cert.title}
            issuer={cert.issuer}
            description={cert.description}
            imageSrc={cert.imageSrc}
            issueDate={cert.issueDate}
            expirationDate={cert.expirationDate}
            expanded={expandedIndex === idx}
            onToggle={() =>
              setExpandedIndex(expandedIndex === idx ? null : idx)
            }
          />
        ))}
      </div>
    </section>
  );
}
