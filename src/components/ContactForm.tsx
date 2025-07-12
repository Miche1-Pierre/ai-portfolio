import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Button from "@/components/Button";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("https://formspree.io/f/xanjrryq", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (res.ok) {
        setStatus("success");
        e.currentTarget.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="name"
        name="name"
        type="text"
        placeholder="Your Name"
        required
      />
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="Your Email"
        required
      />
      <Textarea
        name="message"
        rows={4}
        placeholder="Describe your project..."
        required
      />
      <Button type="submit" variant="outline" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Start Working Together!"}
      </Button>

      {status === "success" && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
          🎉 Message sent successfully! I will get back to you soon.
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded">
          ⚠️ Oops, something went wrong. Please try again.
        </div>
      )}
    </form>
  );
}
