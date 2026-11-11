import React, { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { contentApi, type ContactPageSettings } from "../types/ContentApi";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState<ContactPageSettings | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const controller = new AbortController();
    void contentApi.getContactSettings(controller.signal)
      .then((content) => {
        if (!controller.signal.aborted) setSettings(content);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof Error ? error.message : "Contact information could not be loaded.",
          );
        }
      });
    return () => controller.abort();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      await contentApi.submitContactMessage({
        ...formData,
        subject: formData.subject.trim() || null,
      });
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Your message could not be sent.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5F2] font-sans text-[#333333] flex flex-col justify-between">
      <div>
        <NavBar />

        <section className="bg-white border-b border-[#F2EDE9] py-12 sm:py-16 px-4 sm:px-6 lg:px-0">
          <div className="max-w-[1180px] mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['El_Messiri',_serif]">
              Contact Us
            </h1>
            <p className="text-[#666666] text-lg max-w-[600px] mx-auto leading-relaxed">
              {settings?.introduction ?? "Loading contact information…"}
            </p>
          </div>
        </section>

        <section className="max-w-[1180px] mx-auto my-12 sm:my-16 px-4 sm:px-6 lg:px-0 grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12">
          <div className="md:col-span-7 bg-white p-8 md:p-10 rounded-2xl border border-[#F2EDE9] shadow-sm">
            <h2 className="text-2xl font-bold mb-6 font-['El_Messiri',_serif]">
              Send us a message
            </h2>

            {submitted ? (
              <div className="bg-[#FAF5F2] border border-[#A16F5E] text-[#A16F5E] p-6 rounded-xl text-center">
                <h3 className="font-bold text-lg mb-2">
                  Thank you for reaching out!
                </h3>
                <p className="text-sm text-[#666666]">
                  We have received your message and will get back to you
                  shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
                {errorMessage && (
                  <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {errorMessage}
                  </p>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase text-[#666666] mb-2 tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-md border border-[#EAE3DE] focus:border-[#A16F5E] focus:outline-none text-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#666666] mb-2 tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-md border border-[#EAE3DE] focus:border-[#A16F5E] focus:outline-none text-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#666666] mb-2 tracking-wider">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Course Inquiry, Business, etc."
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-md border border-[#EAE3DE] focus:border-[#A16F5E] focus:outline-none text-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#666666] mb-2 tracking-wider">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-md border border-[#EAE3DE] focus:border-[#A16F5E] focus:outline-none text-sm transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#A16F5E] hover:bg-[#8d5e4f] text-white font-bold py-3.5 rounded-md transition-colors cursor-pointer text-sm shadow-md"
                >
                  Send Message
                </button>
                <p className="text-xs leading-relaxed text-[#765f52]">
                  Your message will be saved for the academy team to review.
                </p>
              </form>
            )}
          </div>

          <div className="md:col-span-5 flex flex-col space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-[#F2EDE9] shadow-sm">
              <h3 className="text-xl font-bold mb-6 font-['El_Messiri',_serif]">
                Get in Touch
              </h3>

              <div className="space-y-6 text-sm">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-[#A16F5E] shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <div>
                    <p className="font-bold text-[#333333] mb-1">
                      Our Location
                    </p>
                    {settings?.mapUrl ? (
                      <a
                        href={settings.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#666666] hover:text-[#A16F5E] leading-relaxed transition-colors block"
                      >
                        {settings.address}
                      </a>
                    ) : (
                      <p className="text-[#666666] leading-relaxed">{settings?.address ?? ""}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-[#A16F5E] shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  <div>
                    <p className="font-bold text-[#333333] mb-1">Email Us</p>
                    <a className="text-[#666666] hover:text-[#A16F5E]" href={`mailto:${settings?.email ?? ""}`}>
                      {settings?.email ?? ""}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-[#A16F5E] shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                  <div>
                    <p className="font-bold text-[#333333] mb-1">Call Us</p>
                    <a className="text-[#666666] hover:text-[#A16F5E]" href={`tel:${settings?.phone ?? ""}`}>
                      {settings?.phone ?? ""}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#B57B65] text-white p-8 rounded-2xl shadow-sm">
              <h4 className="font-bold text-lg mb-2 font-['El_Messiri',_serif]">
                Working Hours
              </h4>
              <p className="text-sm text-[#F5E6E0] leading-relaxed whitespace-pre-line">
                {settings?.workingHours ?? ""}
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
