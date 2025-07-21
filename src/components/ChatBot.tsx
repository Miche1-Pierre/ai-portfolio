"use client";

import ReactMarkdown from "react-markdown";

import { useState, useEffect } from "react";
import Textarea from "@/components/Textarea";
import Card from "@/components/Card";
import Button from "@/components/Button";
import {
  profile,
  experiences,
  educations,
  skills,
  projects,
  siteMetadata,
} from "@/app/const";

const STORAGE_KEY = "ai_questions_asked";
const TIMESTAMP_KEY = "ai_questions_timestamp";
const MAX_QUESTIONS = 5;
const RESET_INTERVAL_HOURS = 24;

export default function AIChat() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);

  const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY!;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedTimestamp = localStorage.getItem(TIMESTAMP_KEY);
    const now = Date.now();

    if (savedTimestamp) {
      const hoursPassed = (now - Number(savedTimestamp)) / (1000 * 60 * 60);
      if (hoursPassed >= RESET_INTERVAL_HOURS) {
        // Reset limit
        localStorage.setItem(STORAGE_KEY, "0");
        localStorage.setItem(TIMESTAMP_KEY, now.toString());
        setQuestionsAsked(0);
      } else {
        setQuestionsAsked(Number(saved || 0));
      }
    } else {
      // First visit
      localStorage.setItem(STORAGE_KEY, "0");
      localStorage.setItem(TIMESTAMP_KEY, now.toString());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(questionsAsked));
    localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
  }, [questionsAsked]);

  if (!OPENAI_API_KEY) {
    return (
      <Card className="p-6 max-w-xl mx-auto">
        <p className="text-red-500">
          OpenAI API key is not set. Please try again later.
        </p>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (questionsAsked >= MAX_QUESTIONS) {
      setResponse(
        "❌ You have reached the question limit. Please come back later."
      );
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const prompt = `
        You are an assistant that answers questions strictly based on the user's personal and professional background.

        Here is the user's context:
        ${JSON.stringify(
          { profile, experiences, educations, skills, projects, siteMetadata },
          null,
          2
        )}

        Now respond to this user input:

        "${input}"

        Instructions:
          - If the message contains a URL, explain you cannot access external content and suggest pasting the text.
          - If it's a question about the user, answer in the third person based only on the data above.
          - Never invent or assume information not provided.
          - Keep the tone professional and friendly.
          - If the input is a LinkedIn post, give insights based on the user’s background.
          - If the question is in another language, respond in that language.
          - Format the output using valid Markdown.
          - Avoid unnecessary detail: keep answers concise and relevant.
          - Do not include images, or emojis in the response.
      `;

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt },
          ],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(data.choices[0].message.content);
        setQuestionsAsked((prev) => prev + 1);
      } else {
        setResponse("Error: " + data.error.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setResponse("Error: " + error.message);
      } else {
        setResponse("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-zinc-500 mb-2">
          Ask one question at a time. Limit of {MAX_QUESTIONS} questions per
          24h.
        </p>
        <Textarea
          rows={4}
          placeholder="Ask me something about my work, projects, or paste a LinkedIn post to analyze..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || questionsAsked >= MAX_QUESTIONS}
        />
        <Button
          type="submit"
          disabled={loading || questionsAsked >= MAX_QUESTIONS}
          variant="outline"
          className="flex items-center justify-center w-full h-10"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 mr-2 text-[#fca96b]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Thinking...
            </>
          ) : (
            "Submit your question"
          )}
        </Button>
      </form>

      {response && (
        <div className="mt-4 whitespace-pre-wrap bg-zinc-100 dark:bg-zinc-800 p-4 rounded opacity-0 animate-fade-in transition-opacity duration-700">
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>
      )}

      {questionsAsked >= MAX_QUESTIONS && (
        <p className="mt-4 text-sm text-red-500 text-center">
          You have reached the question limit. Please come back in 24 hours.
        </p>
      )}
    </Card>
  );
}
