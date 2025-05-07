import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const testimonials = [
  {
    id: 1,
    text: "Justice Connect provided exceptional legal support during a challenging time. Their dedication and expertise were invaluable.",
    author: "Emily R., 34, London",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"
  },
  {
    id: 2,
    text: "The team at Justice Connect was compassionate and thorough. I felt supported every step of the way.",
    author: "Michael T., 45, Manchester",
    avatar: "https://images.unsplash.com/photo-1502767089025-6572583495b9"
  },
  {
    id: 3,
    text: "I highly recommend Justice Connect. Their professionalism and attention to detail made all the difference.",
    author: "Sophia L., 29, Birmingham",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
  },
  {
    id: 4,
    text: "Thanks to Justice Connect, I navigated my legal issues with confidence. Their guidance was top-notch.",
    author: "David K., 52, Leeds",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d"
  },
  {
    id: 5,
    text: "The attorneys at Justice Connect are knowledgeable and approachable. They made a complex process understandable.",
    author: "Olivia M., 38, Glasgow",
    avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg"
  },
  {
    id: 6,
    text: "Justice Connect exceeded my expectations. Their commitment to my case was evident from day one.",
    author: "James S., 41, Bristol",
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12"
  },
  {
    id: 7,
    text: "I felt heard and respected throughout my experience with Justice Connect. Their service is unparalleled.",
    author: "Chloe W., 27, Sheffield",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"
  },
  {
    id: 8,
    text: "Professional, efficient, and empathetic—Justice Connect embodies all these qualities and more.",
    author: "Liam H., 36, Liverpool",
    avatar: "https://images.unsplash.com/photo-1502767089025-6572583495b9"
  },
  {
    id: 9,
    text: "Navigating legal matters was less daunting with Justice Connect by my side. Their support was crucial.",
    author: "Isabella D., 31, Nottingham",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
  },
  {
    id: 10,
    text: "Justice Connect's team is outstanding. Their dedication to clients is truly commendable.",
    author: "Ethan B., 47, Edinburgh",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d"
  }
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
