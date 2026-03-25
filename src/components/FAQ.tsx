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
    <div className="max-w-2xl mx-auto bg-gray-100 rounded-lg p-6 my-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Questions?</h2>
      <div className="space-y-6">
        {FAQ_ITEMS.map((item, idx) => (
          <div key={idx} className="border-b border-gray-200 pb-4 last:border-0">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {item.question}
            </h3>
            <p className="text-sm text-gray-600">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
