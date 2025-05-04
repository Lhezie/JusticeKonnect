import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const testimonials = [
  { text: "I am glad I came in contact with Justice Connect they...", name: "Jane Doe", age: 41, location: "Abuja", image: "/user1.jpg" },
  { text: "I am glad I came in contact with Justice Connect they...", name: "Jane Doe", age: 41, location: "Abuja", image: "/user2.jpg" },
    { text: "I am glad I came in contact with Justice Connect they...", name: "Jane Doe", age: 41, location: "Abuja", image: "/user3.jpg" },
    { text: "I am glad I came in contact with Justice Connect they...", name: "Jane Doe", age: 41, location: "Abuja", image: "/user1.jpg" },
    { text: "I am glad I came in contact with Justice Connect they...", name: "Jane Doe", age: 41, location: "Abuja", image: "/user2.jpg" },
    { text: "I am glad I came in contact with Justice Connect they...", name: "Jane Doe", age: 41, location: "Abuja", image: "/user3.jpg" },
];

const TestimonialCarousel = () => {
  return (
    <div className="mt-6">
    <h2 className="text-md md:text-lg font-semibold pb-3">Testimonials</h2>
    <div className="flex gap-4 overflow-x-auto mt-2">
      {testimonials.map((testimonial) => (
        <div key={testimonial.id} className="p-4 bg-gray-200 rounded-lg min-w-[200px]">
          <p className="italic">{testimonial.text}</p>
          <div className="flex items-center gap-2 mt-2">
            <img
              src={testimonial.avatar}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
            <p className="text-sm text-gray-700">{testimonial.author}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
  );
};

export default TestimonialCarousel;
