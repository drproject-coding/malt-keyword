"use client";

// D-13: Locked FAQ copy from CONTEXT.md — do not edit
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

export function FAQ() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
      <p className="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-6">
        Questions
      </p>
      <div className="space-y-0">
        {FAQ_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className="border-b border-white/10 py-5 last:border-0"
          >
            <h3 className="text-sm font-semibold text-white mb-1.5">
              {item.question}
            </h3>
            <p className="text-sm text-neutral-500">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
