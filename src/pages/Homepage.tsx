import { useContext } from "react";
import { userContext } from "../types/UserContextType";
import NavBar from "../Components/NavBar";
import AnnouncementBanner from "../Components/AnnouncementBanner";
import ForBusinessSection from "../Components/ForBusinessSection";
import TestimonialsSection from "./../Components/TestimonialsSection";
import CTASection from "../Components/CTASection";
import Footer from "../Components/Footer";

function Homepage() {
  const context = useContext(userContext);
  if (!context) {
    return null;
  }
  const { user } = context;
  return (
    <div>
      <NavBar />
      <p>Hi {user.username}</p>
      <p>this is the homepage</p>
      <AnnouncementBanner />
      <ForBusinessSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}

export default Homepage;
