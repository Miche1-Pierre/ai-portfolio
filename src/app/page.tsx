import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { Trusted } from "@/components/site/trusted";
import { Work } from "@/components/site/work";
import { About } from "@/components/site/about";
import { Approach } from "@/components/site/approach";
import { Impact } from "@/components/site/impact";
import { Skills } from "@/components/site/skills";
import { Experience } from "@/components/site/experience";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";

// DA v3 (Dust-inspired) home: hero, trusted-by row, work, about, approach, impact datasheet,
// skills, experience, contact, then the dark band + footer.
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Trusted />
        <Work />
        <About />
        <Approach />
        <Impact />
        <Skills />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
