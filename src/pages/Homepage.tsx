import { useContext, useEffect, useState } from "react";
import { userContext } from "../types/UserContextType";
import NavBar from "../Components/NavBar";
import AnnouncementBanner from "../Components/AnnouncementBanner";
import ForBusinessSection from "../Components/ForBusinessSection";
import TestimonialsSection from "./../Components/TestimonialsSection";
import CTASection from "../Components/CTASection";
import FaqSection from "../Components/FaqSection";
import Footer from "../Components/Footer";
import Opening from "../Components/Opening"
import { contentApi, type LandingPageResponse } from "../types/ContentApi";

function Homepage() {
  const context = useContext(userContext);
  const [landing, setLanding] = useState<LandingPageResponse | null>(null);
  const [landingError, setLandingError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    void contentApi.getLandingPage(controller.signal)
      .then((content) => {
        if (!controller.signal.aborted) setLanding(content);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLandingError(
            error instanceof Error ? error.message : "Homepage content could not be loaded.",
          );
          console.error("Homepage content could not be loaded.", error);
        }
      });
    return () => controller.abort();
  }, []);

  if (!context) {
    return null;
  }

//   const { user } = context;
  return (
    <div>
      <NavBar />
      {landingError && (
        <p role="alert" className="mx-auto max-w-[1180px] px-4 py-3 text-sm text-red-700">
          Some homepage sections could not be loaded: {landingError}
        </p>
      )}
      {/* <p>Hi {user.username}</p>
      <p>this is the homepage</p> */}
      <Opening content={landing} />
      <AnnouncementBanner banners={landing?.banners ?? []} />
      <ForBusinessSection highlights={landing?.highlights ?? []} />
      <TestimonialsSection testimonials={landing?.testimonials ?? []} />
      <FaqSection faqs={landing?.faqs ?? []} />
      <CTASection />
      <Footer />
    </div>
  );
}

export default Homepage;
