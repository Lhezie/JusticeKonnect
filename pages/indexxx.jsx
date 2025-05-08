import Image from "next/image";

export default function HeroPage() {
  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Image src="/logoTwo.png" alt="Justice Connect Logo" width={40} height={40} />
            {/* <span className="text-lg font-semibold text-gray-800">JusticeConnect</span> */}
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6 text-sm text-gray-700 font-medium">
            <a href="#home" className="hover:text-blue-500">Home</a>
            <a href="#trial-attorneys" className="hover:text-blue-500">Trial Attorneys</a>
            <a href="#practice-areas" className="hover:text-blue-500">Practice Areas</a>
            <a href="#areas-we-serve" className="hover:text-blue-500">Areas We Serve</a>
            <a href="#results" className="hover:text-blue-500">Results</a>
            <a href="#testimonials" className="hover:text-blue-500">Testimonials</a>
            <a href="#blog" className="hover:text-blue-500">Blog</a>
            <a href="#locations" className="hover:text-blue-500">Locations</a>
            <a href="#contact" className="hover:text-blue-500">Contact</a>
          </nav>

          {/* Right side: Search + Contact */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Icon */}
            <button className="text-gray-700 hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z" />
              </svg>
            </button>
            {/* Contact Box */}
            <div className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m0 4v10m5-6h6m-3-3v6" />
              </svg>
              <span>Free Consultations:</span>
              <span className="font-bold">(123) 456-7890</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative text-white h-screen flex items-center justify-center pt-20">
        {/* Background image */}
        <Image
          src="/lawImage.png"
          alt="Hero Background"
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          className="absolute inset-0 z-0"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl w-full flex flex-col md:flex-row items-center justify-between px-6">
          {/* Left Text Content */}
          <div className="md:w-1/2 text-left space-y-6">
            <p className="text-lg">Attorneys at Law</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Definitely the Team you Want on your Side
            </h1>
            <p className="mt-2 text-lg">
              We Have Recovered Over <span className="font-bold">$425 Million</span> for our Clients.
            </p>
            <button className="mt-6 bg-blue-400 hover:bg-blue-500 text-white px-6 py-3 rounded-md text-sm font-medium">
              Free Case Evaluation
            </button>
          </div>

          {/* Optional Right Side (Image Already in BG) */}
          <div className="hidden md:block md:w-1/2"></div>
        </div>
      </section>
    </div>
  );
}
