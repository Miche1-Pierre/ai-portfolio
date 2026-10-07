import { Navbar } from "@/components/site/navbar";
import { Intro } from "@/components/intro/intro";
import { Trusted } from "@/components/site/trusted";
import { Work } from "@/components/site/work";
import { About } from "@/components/site/about";
import { Approach } from "@/components/site/approach";
import { Impact } from "@/components/site/impact";
import { Skills } from "@/components/site/skills";
import { Experience } from "@/components/site/experience";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";

// Home: the intro (hero over a 3D isometric world, then a scroll tour of how Pierre works), the
// trusted-by row, work, about, approach, impact datasheet, skills, experience, contact, footer.
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Intro />
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
