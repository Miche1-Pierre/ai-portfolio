import NavigationMenu from "@/components/NavigationMenu";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Badge from "@/components/Badge";
import FloatingBadgeCloud from "@/components/FloatingBadgeCloud";
import Textarea from "@/components/Textarea";
import Button from "@/components/Button";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <header className="p-6 sm:p-10 flex justify-center">
        <NavigationMenu />
      </header>

      <main className="flex-grow px-6 sm:px-20 py-10 flex flex-col gap-28 items-center text-left">
        {/* Hero */}
        <section className="max-w-3xl">
          <Badge>Welcome</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-4 leading-tight">
            I craft <span className="text-[#45d8ac]">modern</span> web
            experiences that are
            <span className="text-[#45d8ac]"> fast</span>,{" "}
            <span className="text-[#45d8ac]">elegant</span> and{" "}
            <span className="text-[#45d8ac]">meaningful</span>.
          </h1>
          <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400">
            I&apos;m a web developer specialized in building performant web apps
            using modern technologies like React, TypeScript, and Next.js.
          </p>
        </section>

        {/* Tech Stack */}
        <section className="w-full flex justify-center align-middle">
          <FloatingBadgeCloud />
        </section>

        {/* Contact / Call to action */}
        <section className="w-full max-w-xl">
          <Card className="p-6 sm:p-8 text-center sm:text-left">
            <h2 className="text-2xl font-semibold mb-4">Start a project</h2>
            <p className="text-base mb-6 text-zinc-600 dark:text-zinc-400">
              Got an idea or need a dev? Let&apos;s bring your vision to life.
            </p>
            <form className="flex flex-col gap-4">
              <Input type="text" placeholder="Your Name" required />
              <Input type="email" placeholder="Your Email" required />
              <Textarea
                rows={4}
                placeholder="Describe your project..."
                required
              />
              <Button className="mt-4" type="submit" variant="outline">
                Send Message
              </Button>
            </form>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
