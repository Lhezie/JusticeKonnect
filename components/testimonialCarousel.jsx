"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

const testimonials = [
  {
    text: "I am glad I came in contact with Justice Connect they...",
    name: "Jane Doe",
    age: 41,
    location: "Abuja",
    image: "/user1.jpg",
  },
  {
    text: "The support I got from Justice Connect changed everything...",
    name: "John Smith",
    age: 35,
    location: "Lagos",
    image: "/user2.jpg",
  },
  {
    text: "Their lawyers are professional and very responsive!",
    name: "Amaka Obi",
    age: 29,
    location: "Enugu",
    image: "/user3.jpg",
  },
  {
    text: "Finally, a platform that makes legal help accessible.",
    name: "Musa Aliyu",
    age: 50,
    location: "Kano",
    image: "/user1.jpg",
  },
  {
    text: "Highly recommend Justice Connect to friends and family.",
    name: "Grace Uche",
    age: 44,
    location: "Port Harcourt",
    image: "/user2.jpg",
  },
];

const TestimonialCarousel = () => {
  return (
    <div className="mt-6 px-2">
      <h2 className="text-md md:text-lg font-semibold pb-3">Testimonials</h2>
      <Swiper
        spaceBetween={16}
        slidesPerView={"auto"}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        className="pb-6"
      >
        {testimonials.map((testimonial, index) => (
          <SwiperSlide
            key={index}
            style={{ width: "250px" }}
            className="p-4 bg-gray-100 rounded-lg"
          >
            <p className="italic text-sm text-gray-700">{testimonial.text}</p>
            <div className="flex items-center gap-2 mt-3">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold">{testimonial.name}</p>
                <p className="text-xs text-gray-500">
                  {testimonial.age}, {testimonial.location}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TestimonialCarousel;
