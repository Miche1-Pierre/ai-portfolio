/**
 * The scroll tour at the top of the home page: how Pierre works, as a forward deployed engineer.
 * Steps 2 to 4 restate the approach section in his own words (same facts, nothing added); steps 1
 * and 5 describe the forward deployed part (on site with the team, then iterating in production).
 */
export const introSteps = [
  {
    id: "embed",
    tag: "Embed",
    title: "Embedded with your team",
    body: "Forward deployed: I sit with the people who do the work and map their real workflow, their data and their constraints before deciding anything.",
  },
  {
    id: "scope",
    tag: "Scope",
    title: "Scope & architecture",
    body: "We align on the outcome, the constraints and the architecture before a line of code, so the build has a spine.",
  },
  {
    id: "build",
    tag: "Build",
    title: "Build in the loop",
    body: "Ship in governed increments, with the right tools in the loop, human approval at each gate, and a real audit trail.",
  },
  {
    id: "ship",
    tag: "Ship",
    title: "Harden & ship",
    body: "Security, observability and QA through to production, with the documentation that keeps it maintainable.",
  },
  {
    id: "launch",
    tag: "Launch",
    title: "Launch & iterate",
    body: "In production, I stay close to the users: measure, iterate, and hand over to a team that owns it.",
  },
] as const;

export type IntroStep = (typeof introSteps)[number];
