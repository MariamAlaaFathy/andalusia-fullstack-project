export default function AnnouncementBanner() {
  return (
    <div className="max-w-[1180px] mx-auto my-6 px-4 sm:px-6 lg:px-0">
      <div className="w-full bg-gradient-to-r from-[#B99081] to-[#A16F5E] text-white rounded-xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="max-w-[750px]">
          <h3 className="text-2xl font-semibold mb-2 font-['El_Messiri',_serif]">
            New: Full Stack Development (.NET)
          </h3>
          <p className="text-base text-[#F5E6E0] leading-relaxed">
            Launching next month — join the waitlist to get early access and a
            founding-cohort discount.
          </p>
        </div>
        <button className="bg-white hover:bg-[#F5F1EF] text-[#A16F5E] font-bold px-8 py-3 rounded-md whitespace-nowrap transition-colors cursor-pointer text-sm shadow-sm">
          Join waitlist
        </button>
      </div>
    </div>
  );
}
