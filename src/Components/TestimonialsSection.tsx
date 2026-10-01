export default function TestimonialsSection() {
  const testimonialsData = [
    {
      id: 1,
      quote:
        '"Courses and conferences are well-organized and professionally managed. Andalusia Academy offering accredited courses and conferences for medical and non-medical professionals also."',
      author: "Abdlhamid Medhat",
    },
    {
      id: 2,
      quote:
        '"Your future starts with one click. Join thousands of successful learners."',
      author: "Amr Gamal",
    },
    {
      id: 3,
      quote:
        '"Every graduate starts with a lesson. Learn today, lead tomorrow."',
      author: "Karim Fakhry",
    },
  ];

  return (
    <div className="max-w-[1180px] mx-auto my-12 sm:my-16 px-4 sm:px-6 lg:px-0">
      <h2 className="text-3xl font-bold text-[#333333] mb-10 font-['El_Messiri',_serif] text-center md:text-left">
        What learners say
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonialsData.map((item) => (
          <div
            key={item.id}
            className="bg-[#B57B65] text-white rounded-3xl p-8 flex flex-col justify-between shadow-md min-h-[280px]"
          >
            <div className="text-center h-full flex flex-col justify-center">
              <p className="text-base leading-relaxed">{item.quote}</p>
            </div>
            <div className="text-center pt-6">
              <p className="font-bold text-lg">{item.author}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
