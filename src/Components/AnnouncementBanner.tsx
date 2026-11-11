import type { LandingPageBanner } from "../types/ContentApi";

export default function AnnouncementBanner({ banners }: { banners: LandingPageBanner[] }) {
  if (!banners.length) return null;

  return (
    <div className="mx-auto my-6 max-w-[1180px] space-y-4 px-4 sm:px-6 lg:px-0">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="flex w-full flex-col items-start justify-between gap-6 rounded-xl bg-gradient-to-r from-[#B99081] to-[#A16F5E] p-8 text-white shadow-sm md:flex-row md:items-center md:p-10"
        >
          <div className="max-w-[750px]">
            <h3 className="mb-2 font-['El_Messiri',_serif] text-2xl font-semibold">
              {banner.title}
            </h3>
            <p className="text-base leading-relaxed text-[#F5E6E0]">
              {banner.description}
            </p>
          </div>
          {banner.imageUrl && (
            <img
              src={banner.imageUrl}
              alt=""
              className="h-28 w-full rounded-lg object-cover md:w-48"
            />
          )}
          {banner.callToActionText && banner.callToActionUrl && (
            <a
              href={banner.callToActionUrl}
              className="cursor-pointer whitespace-nowrap rounded-md bg-white px-8 py-3 text-sm font-bold text-[#A16F5E] shadow-sm transition-colors hover:bg-[#F5F1EF]"
            >
              {banner.callToActionText}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
