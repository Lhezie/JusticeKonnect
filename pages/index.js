import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // useEffect stays the same
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.querySelectorAll(".fade-in").forEach((el) => {
        el.classList.add("opacity-100", "translate-y-0");
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.querySelectorAll(".fade-in").forEach((el) => {
        el.classList.add("opacity-100", "translate-y-0");
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col scroll-smooth">
      {/* ✅ NEW HEADER */}
      <header className="bg-blue-50 shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-[110rem] mx-auto flex justify-between items-center px-6 py-">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Image
              src="/logoTwo.png"
              alt="Justice Connect Logo"
              width={60}
              height={40}
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-4">
            {[
              { label: "About", href: "#about" },
              { label: "Blog", href: "#practice" },
              { label: "Join Us", href: "#register" },
              { label: "Testimonials", href: "#testimonials" },
              { label: "Contact Us", href: "#contact" },
            ].map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className="inline-flex items-center justify-center px-5 py-2 rounded-tl-3xl rounded-br-3xl text-sm font-semibold text-gray-700 bg-blue-100 border border-blue-400 hover:bg-blue-400 hover:text-white hover:shadow-lg transition-all duration-300 min-w-[120px] text-center"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Hamburger */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
              <svg className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* ✅ SIDEBAR MENU */}
      <div
        className={`fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50 transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <Image
            src="/logoTwo.png"
            alt="Justice Connect Logo"
            width={60}
            height={40}
          />
          <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
            <svg className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex flex-col space-y-4 p-6 text-gray-700 font-medium">
          <a
            href="#about"
            onClick={() => setIsMenuOpen(false)}
            className="hover:text-blue-500"
          >
            About
          </a>
          <a
            href="#practice"
            onClick={() => setIsMenuOpen(false)}
            className="hover:text-blue-500"
          >
            Practice Areas
          </a>
          <a
            href="#register"
            onClick={() => setIsMenuOpen(false)}
            className="hover:text-blue-500"
          >
            Join Us
          </a>
          <a
            href="#testimonials"
            onClick={() => setIsMenuOpen(false)}
            className="hover:text-blue-500"
          >
            Testimonials
          </a>
          <a
            href="#contact"
            onClick={() => setIsMenuOpen(false)}
            className="hover:text-blue-500"
          >
            Contact
          </a>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white flex flex-col md:flex-row items-center justify-center md:px-4  md:pt-32 overflow-hidden fade-in opacity-0 translate-y-10 transition-all duration-1000">
        <div className="hidden md:block absolute inset-0 z-0">
          <Image
            src="/lawImageTwo.jpg"
            alt="Background"
            layout="fill"
            objectFit="cover"
            objectPosition="center"
            className="opacity-60"
          />
        </div>

        {/* Small screen: full bg image */}
        <div className="relative w-full h-[600px] md:hidden">
          <Image
            src="/lawImage.png"
            alt="Trusted Legal Partner"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 z-0 opacity-60"
          />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl font-bold leading-tight tracking-tight drop-shadow-lg">
              Your Trusted Legal Partner
            </h1>
            <p className="mt-4 text-lg text-gray-200">
              #1 in Client Satisfaction
            </p>
            <button className="mt-6 bg-blue-400 hover:bg-blue600 text-white px-6 py-3 rounded-md shadow transition">
              Discover Our Services
            </button>
            <div className="mt-12 w-full max-w-xl">
              <div className="flex items-center bg-white rounded-lg shadow-lg overflow-hidden">
                <input
                  type="text"
                  placeholder="Search for services..."
                  className="w-full px-4 py-3 text-gray-700 focus:outline-none bg-white"
                />
                <button className="px-4 text-gray-500 hover:text-gray-700 transition">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* md and up: side-by-side */}
        <div className="hidden md:flex w-full max-w-7xl relative z-10">
          <div className="flex flex-col justify-center w-1/2 pr-8 relative z-10">
            <h1 className="text-2xl md:text-5xl font-bold leading-tight tracking-tight">
              Your Trusted Legal Partner
            </h1>
            <p className="mt-4 text-lg text-gray-200">
              #1 in Client Satisfaction
            </p>
            <button className="  mt-6 bg-blue-400 hover:bg-blue-600 text-white px-6 py-3 rounded-md w-fit shadow transition">
              Discover Our Services
            </button>

            {/* Search */}
            <div className="mt-12 md:mt-4  w-full max-w-md">
              <div className="flex items-center bg-white rounded-lg shadow-lg overflow-hidden">
                <input
                  type="text"
                  placeholder="Search for services..."
                  className="w-full px-4 py-3 text-gray-700 focus:outline-none bg-white"
                />
                <button className="px-4 text-gray-500 hover:text-gray-700 transition">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="w-1/2 relative h-[600px] overflow-hidden">
            <Image
              src="/lawImageTwo.jpg"
              alt="Trusted Legal Partner"
              layout="fill"
              objectFit="cover"
              objectPosition="right top"
              className="fade-edge"
            />
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-16 bg-gradient-to-r from-blue-400 via-yellow-500 to-blue-400 text-center px-4 fade-in opacity-0 translate-y-10 transition-all duration-1000 delay-200">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4 relative inline-block after:block after:w-16 after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-blue-300 after:mt-2 after:mx-auto">
          Advocating for your rights with dedication and expertise
        </h2>
        <p className="max-w-2xl mx-auto  leading-relaxed text-black">
          At Justice Connect, we believe in providing top-notch legal services
          with a personal touch. Our team of experienced professionals is here
          to help you navigate even the toughest legal challenges.
        </p>
      </section>

      {/* Registration Section */}
      <section
        id="register"
        className="py-16 bg-blue-200 text-center px-4 fade-in opacity-0 translate-y-10 transition-all duration-1000 delay-300"
      >
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8 relative inline-block after:block after:w-16 after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-blue-300 after:mt-2 after:mx-auto">
          Join Justice Connect
        </h2>
        <p className="max-w-2xl mx-auto text-black mb-8">
          Whether you're a client seeking legal help or a lawyer offering
          services, we welcome you to join our community.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-8 ">
          {[
            {
              title: "Register as a Client",
              desc: "Need legal help? Create your account and start your journey to justice.",
              href: "/clientRegisterPage",
              btn: "Get Started",
            },
            {
              title: "Register as a Lawyer",
              desc: "Join as a lawyer and connect with clients who need your expertise.",
              href: "/lawyerRegisterPage",
              btn: "Join Now",
            },
          ].map((item, idx) => (
            <div key={idx} className="relative w-full md:w-1/3">
              <div className="animated-border-card relative bg-white rounded-lg p-6 hover:shadow-2xl transform hover:scale-105 transition-all z-10">
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className=" mb-4 text-black">{item.desc}</p>
                <button
                  onClick={() => (window.location.href = item.href)}
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-2xl shadow transition "
                >
                  {item.btn}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-16 bg-gray-100 text-center px-4 fade-in opacity-0 translate-y-10 transition-all duration-1000 delay-500 relative overflow-hidden"
        style={{
          backgroundImage: 'url("/gravelOne.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>

        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-12 relative inline-block after:block after:w-16 after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-blue-300 after:mt-2 after:mx-auto">
            Client Testimonials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[
              {
                text: "Justice Connect was exceptional in handling my case. Their attention to detail and care was unmatched.",
                author: "Stephen Quigg",
                avatar: "/avatar1.jpg",
              },
              {
                text: "I felt supported and heard throughout the entire process. Highly recommend their team!",
                author: "Matt Wislocki",
                avatar: "/avatar2.jpg",
              },
              {
                text: "A fantastic legal team that delivers results. I couldn't be happier with their service.",
                author: "Margarita C.",
                avatar: "/avatar3.jpg",
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-6 text-left transform transition-transform duration-300 hover:scale-105 hover:shadow-xl border border-gray-200"
              >
                <div className="text-blue-500 text-4xl mb-4">“</div>
                <p className="text-gray-600 italic mb-6 leading-relaxed">
                  {testimonial.text}
                </p>
                <div className="flex items-center">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">
                      {testimonial.author}
                    </p>
                    <div className="flex text-yellow-400 mt-1">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <svg
                            key={i}
                            className="w-4 h-4 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09L5.824 12 .674 7.91l6.09-.888L10 2l3.236 5.022 6.09.888-4.55 4.09 1.702 5.09z" />
                          </svg>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-10 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow transition">
            View All Testimonials
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-400 text-gray-300 py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2 pt-4">Justice Connect</h3>
            <p>
              © {new Date().getFullYear()} Justice Connect. All rights reserved.
            </p>
          </div>
          <nav className="mt-4 md:mt-0 space-y-2 md:space-y-0 md:space-x-6 pt-12">
            <a href="#" className="hover:text-white transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition">
              Contact Us
            </a>
          </nav>
        </div>
      </footer>

      {/* Fade effect */}
      <style jsx>{`
        .fade-edge {
          mask-image: linear-gradient(to left, black 75%, transparent 100%);
          -webkit-mask-image: linear-gradient(
            to left,
            black 75%,
            transparent 100%
          );
        }
      `}</style>
    </div>
  );
}
