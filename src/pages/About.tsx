import { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import { contentApi, type AboutPageBlock } from "../types/ContentApi";

export default function About() {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<AboutPageBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void contentApi.getAbout(controller.signal)
      .then((content) => {
        if (!controller.signal.aborted) setBlocks(content);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof Error ? error.message : "About content could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const [intro, ...contentBlocks] = blocks;

  return (
    <div className="min-h-screen bg-[#FAF5F2] font-sans text-[#333333] flex flex-col justify-between">
      <div>
        <NavBar />

        <section className="bg-white border-b border-[#F2EDE9] py-12 sm:py-16 px-4 sm:px-6 lg:px-0">
          <div className="max-w-[1180px] mx-auto text-center">
            {isLoading ? (
              <p role="status">Loading about content…</p>
            ) : errorMessage ? (
              <p role="alert" className="text-red-700">{errorMessage}</p>
            ) : intro ? (
              <>
                <h1 className="mb-4 font-['El_Messiri',_serif] text-4xl font-bold md:text-5xl">
                  {intro.title}
                </h1>
                <p className="mx-auto max-w-[700px] whitespace-pre-line text-lg leading-relaxed text-[#666666]">
                  {intro.body}
                </p>
              </>
            ) : (
              <p>No About page content has been published yet.</p>
            )}
          </div>
        </section>

        {contentBlocks.length > 0 && (
          <section className="mx-auto my-12 grid max-w-[1180px] gap-6 px-4 sm:my-16 sm:px-6 md:grid-cols-2 lg:px-0">
            {contentBlocks.map((block) => (
              <div
                key={block.id}
                className="rounded-2xl border border-[#F2EDE9] bg-white p-8 shadow-sm"
              >
                <h2 className="mb-3 font-['El_Messiri',_serif] text-2xl font-bold">
                  {block.title}
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-[#666666]">
                  {block.body}
                </p>
              </div>
            ))}
          </section>
        )}

        <section className="bg-white border-t border-[#F2EDE9] py-16 px-4 text-center">
          <div className="max-w-[700px] mx-auto">
            <h2 className="text-3xl font-bold mb-4 font-['El_Messiri',_serif]">
              Ready to start your journey?
            </h2>
            <p className="text-[#666666] mb-8">
              Explore our full course catalog or create an account to begin
              learning today.
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="bg-[#A16F5E] hover:bg-[#8d5e4f] text-white font-bold px-8 py-3.5 rounded-md transition-colors cursor-pointer text-sm shadow-md"
            >
              Get Started Free
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
