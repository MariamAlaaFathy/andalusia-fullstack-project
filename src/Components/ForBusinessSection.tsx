import { Link } from "react-router-dom";
import type { LandingPageHighlight } from "../types/ContentApi";

export default function ForBusinessSection({ highlights }: { highlights: LandingPageHighlight[] }) {
  if (!highlights.length) return null;

  return (
    <div
      id="for-business"
      className="mx-auto my-12 grid max-w-[1180px] gap-6 px-4 sm:my-16 sm:px-6 lg:grid-cols-2 lg:px-0"
    >
      {highlights.map((highlight) => (
        <article
          key={highlight.id}
          className="rounded-2xl border border-[#F2EDE9] bg-white p-8 shadow-sm"
        >
          <h2 className="mb-4 font-['El_Messiri',_serif] text-3xl font-bold text-[#333333]">
            {highlight.title}
          </h2>
          <p className="mb-6 max-w-[500px] text-base leading-relaxed text-[#666666]">
            {highlight.description}
          </p>
          <Link
            to="/Contact"
            className="inline-flex rounded-md border-2 border-[#A16F5E] px-6 py-3 text-sm font-bold text-[#A16F5E] transition-colors hover:bg-[#A16F5E] hover:text-white"
          >
            Talk to our team
          </Link>
        </article>
      ))}
    </div>
  );
}
