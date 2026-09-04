import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { Marquee } from "@/components/site/marquee";
import { Bento } from "@/components/site/bento";
import { Work } from "@/components/site/work";
import { Experience } from "@/components/site/experience";
import { Skills } from "@/components/site/skills";
import { Approach } from "@/components/site/approach";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Bento />
        <Work />
        <Experience />
        <Skills />
        <Approach />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
