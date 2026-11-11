import type { LandingPageFaq } from "../types/ContentApi";

export default function FaqSection({ faqs }: { faqs: LandingPageFaq[] }) {
  if (!faqs.length) return null;

  return (
    <section className="mx-auto my-12 max-w-[1180px] px-4 sm:my-16 sm:px-6 lg:px-0">
      <h2 className="mb-8 text-3xl font-bold text-[#333333] sm:text-4xl">
        Frequently asked questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.id}
            className="rounded-xl border border-[#F2EDE9] bg-white p-5"
          >
            <summary className="cursor-pointer font-semibold text-[#333333]">
              {faq.question}
            </summary>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-[#666666]">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
