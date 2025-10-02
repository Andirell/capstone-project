import MaxWidthContainer from "@/components/things-to-share/max-width-container";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <section className="bg-[#FFF8F0] py-16">
      <MaxWidthContainer>
        <div className="space-y-16">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="text-center space-y-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Customer Support Center
                </h2>
                <p className="text-gray-600 text-base md:text-lg">
                  Welcome to our Customer Support Center, your dedicated hub for
                  prompt assistance, reliable solutions, and personalized
                  guidance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Talk to Us Directly
                  </h3>
                  <p className="text-[#EC5C42] font-bold text-lg">
                    +2349057479783
                  </p>
                </div>

                <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Address
                  </h3>
                  <p className="text-gray-600">
                    Ajamgbadi Mountain Rd.
                    <br />
                    Ikefun, Lagos 10123, Nigeria.
                  </p>
                </div>

                <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Contact by Email
                  </h3>
                  <p className="text-[#EC5C42] font-medium">
                    {" "}
                    JobZonline1@gmail.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
              Contact Us
            </h1>
            <p className="text-center text-base md:text-lg text-gray-600 mb-8">
              Have questions, suggestions, or need support? We&apos;d love to
              hear from you. Fill out the form below and our team will get back
              to you as soon as possible.
            </p>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 "
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 "
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  placeholder="Write your message here..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 "
                  required
                ></textarea>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#EC5C42] hover:bg-[#d84f39] text-white py-6  rounded-xl font-semibold transition"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </MaxWidthContainer>
    </section>
  );
}
