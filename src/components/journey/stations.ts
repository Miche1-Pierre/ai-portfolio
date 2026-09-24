import { education, experiences } from "@/content/experience";
import { projectBySlug } from "@/content/projects";
import { site } from "@/content/site";
import { skillGroups } from "@/content/skills";

/** Abscisse (m) où le scroll 0 pose le rover : 0, garé dans le hangar (la caméra d'intro exportée
 *  par Blender démarre à l'intérieur). Partagé par la scène et le HUD. */
export const JOURNEY_START_S = 0;

export type Station = {
  id: string;
  /** Position sur la piste, 0..1 (abscisse curviligne / longueur). */
  t: number;
  eyebrow: string;
  title: string;
  body: string;
  side: "left" | "right";
  cta?: { label: string; href: string };
};

type PathStation = { name: string; s: number };

const byCompany = (needle: string) => experiences.find((e) => e.company.toLowerCase().includes(needle.toLowerCase()));
const tagline = (slug: string) => projectBySlug(slug)?.tagline ?? "";

/** Un carnet par halte de la route exportée par Blender (STORYTELLING §3.9), dans l'ordre du
 *  parcours : chaque zone raconte une section du site. */
export function buildStations(pathStations: readonly PathStation[], length: number): Station[] {
  const at = (name: string) => {
    const found = pathStations.find((s) => s.name === name);
    return found ? found.s / length : 0;
  };
  const loria = byCompany("LORIA");
  const synapsia = byCompany("SYNAPSIA");
  const nancyclotep = byCompany("Nancyclotep");
  const peel = byCompany("PeeL");
  const techguys = byCompany("TechGuys");
  const plania = byCompany("Plania");
  const school = education[0];

  const drafts: Omit<Station, "side">[] = [
    {
      id: "garage",
      t: at("garage"),
      eyebrow: "Low Tide · prototype",
      title: site.headline,
      body:
        "The tide went out for good. What it left behind is a road going up: this is my portfolio as a journey. " +
        `${site.title}. ${site.availability}. Scroll to start the engine.`,
    },
    {
      id: "phare",
      t: at("phare"),
      eyebrow: "The lighthouse",
      title: "It is off, for now.",
      body: "It lights up again once you reach the summit. Every stop on the way is a chapter, in the order I lived it: the school, the first missions, the workshop, the snow, and what I am building today.",
    },
    {
      id: "borne-2023",
      t: at("borne-2023"),
      eyebrow: `Milestone ${school.start}`,
      title: "Where the climb starts.",
      body: `${school.degree}, ${school.school} (${school.detail}). First shipped project: Admin MNS, ${tagline("admin-mns").toLowerCase()}`,
      cta: { label: "The whole road", href: "/#experience" },
    },
    {
      id: "borne-2024",
      t: at("borne-2024"),
      eyebrow: `Milestone ${loria?.start ?? "2024"}`,
      title: loria?.company ?? "LORIA",
      body: `${loria?.role ?? ""}. ${loria?.summary ?? ""}`,
      cta: { label: "The whole road", href: "/#experience" },
    },
    {
      id: "borne-2025",
      t: at("borne-2025"),
      eyebrow: `Milestone ${synapsia?.start ?? "2025"}`,
      title: synapsia?.company ?? "SYNAPSIA",
      body: `${synapsia?.role ?? ""}. ${synapsia?.summary ?? ""} ${tagline("speedreporting")}`,
      cta: { label: "SpeedReporting", href: "/work/speedreporting" },
    },
    {
      id: "poste-de-controle",
      t: at("poste-de-controle"),
      eyebrow: `The checkpoint · ${nancyclotep?.start ?? "2025"}`,
      title: "Every batch accounted for.",
      body: `${nancyclotep?.company ?? "Nancyclotep"}, ${nancyclotep?.role ?? ""}. ${nancyclotep?.summary ?? ""} ${tagline("pharma-lims")}`,
      cta: { label: "Read the case study", href: "/work/pharma-lims" },
    },
    {
      id: "borne-dec-2025",
      t: at("borne-dec-2025"),
      eyebrow: `The road worker's cabin · ${peel?.start ?? "Dec 2025"}`,
      title: "Where my own tools start.",
      body: `${peel?.role ?? "Student Entrepreneur"}, ${peel?.company ?? ""}. ${peel?.summary ?? ""} Taskforce and Brain OS are drawn here first.`,
    },
    {
      id: "atelier",
      t: at("atelier"),
      eyebrow: "The workshop",
      title: "The tools I climb with.",
      body: skillGroups.map((g) => `${g.title}: ${g.blurb}`).join(" "),
      cta: { label: "All the skills", href: "/#skills" },
    },
    {
      id: "col-neige",
      t: at("col-neige"),
      eyebrow: "The snow line",
      title: "The road changes country.",
      body: `Above the snow line, winter: Montréal, ${techguys?.start ?? "February 2026"}. New clients, a new team, and the people met along the way.`,
    },
    {
      id: "gare",
      t: at("gare"),
      eyebrow: `The station · ${techguys?.start ?? "2026"}`,
      title: techguys?.company ?? "TechGuys",
      body: `${techguys?.role ?? ""}. ${techguys?.summary ?? ""}`,
      cta: { label: "The whole road", href: "/#experience" },
    },
    {
      id: "maisons",
      t: at("maisons"),
      eyebrow: "Three houses, three clients",
      title: "Lights in the windows.",
      body: `${projectBySlug("ai-sales-agent")?.name ?? ""}: ${tagline("ai-sales-agent")} ${projectBySlug("incident-triage")?.name ?? ""}: ${tagline("incident-triage")} ${projectBySlug("lease-financing")?.name ?? ""}: ${tagline("lease-financing")}`,
      cta: { label: "The client work", href: "/#work" },
    },
    {
      id: "auberge",
      t: at("auberge"),
      eyebrow: `The inn · ${plania?.start ?? "2026"}`,
      title: plania?.company ?? "Plania",
      body: `${plania?.role ?? ""}. ${plania?.summary ?? ""} ${tagline("plania")}`,
      cta: { label: "Read the case study", href: "/work/plania" },
    },
    {
      id: "observatoire",
      t: at("observatoire"),
      eyebrow: "The observatory",
      title: "What I am building today.",
      body: `Taskforce: ${tagline("taskforce")} Brain OS: ${tagline("brain-os")}`,
      cta: { label: "Taskforce, the case study", href: "/work/taskforce" },
    },
    {
      id: "bout",
      t: at("bout"),
      eyebrow: "The end of the road",
      title: "Send a signal.",
      body: `${site.availability}, relocating to Montréal. The lighthouse in the harbour is on again. Say hello, or come and see the classic site.`,
      cta: { label: "Get in touch", href: "/#contact" },
    },
  ];
  // Dans l'ordre de la route (l'île visite l'atelier après le village), un côté sur deux.
  return drafts
    .sort((a, b) => a.t - b.t)
    .map((s, i) => ({ ...s, side: i % 2 === 0 ? "right" : "left" }));
}
