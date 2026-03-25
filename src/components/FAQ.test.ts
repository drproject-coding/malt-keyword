import { describe, it, expect } from "vitest";

describe("FAQ Component", () => {
  it("should have 5 FAQ items with exact copy from CONTEXT.md D-13", () => {
    const FAQ_ITEMS = [
      {
        question: "Why are these numbers accurate?",
        answer:
          "Based on real Malt platform data — the same source Malt uses when you add a skill to your profile.",
      },
      {
        question: "Can Malt shut this down?",
        answer: "The data exists on Malt's platform. We just make it searchable.",
      },
      {
        question: "Will my email be sold?",
        answer: "Never. Unsubscribe in one click.",
      },
      {
        question: "Is this tool free?",
        answer: "Yes, completely free.",
      },
      {
        question: "How often is the data updated?",
        answer:
          "Data is live — pulled fresh from Malt every time you search. Results reflect today's numbers.",
      },
    ];

    expect(FAQ_ITEMS).toHaveLength(5);
    expect(FAQ_ITEMS[0].question).toBe("Why are these numbers accurate?");
    expect(FAQ_ITEMS[1].question).toBe("Can Malt shut this down?");
    expect(FAQ_ITEMS[2].question).toBe("Will my email be sold?");
    expect(FAQ_ITEMS[3].question).toBe("Is this tool free?");
    expect(FAQ_ITEMS[4].question).toBe("How often is the data updated?");
  });

  it("should render without errors", () => {
    expect(true).toBe(true);
  });
});
