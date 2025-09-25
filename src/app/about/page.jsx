
import MaxWidthContainer from "@/components/things-to-share/max-width-container";



export default function About() {
  return (
     <section className="py-16 bg-[#FFF8F0]">
        <MaxWidthContainer>
          <div className="text-center mb-12">
            <h1 className="text-3xl  font-bold text-[#3C1414]">
              About Us
            </h1>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Welcome to <span className="font-semibold">JobZ</span>, 
              the platform built to connect job seekers with meaningful career 
              opportunities and help employers find the best talent with ease.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 mb-16">
            <div className="p-6 bg-white rounded-2xl shadow hover:shadow">
              <h2 className="text-xl font-semibold text-[#EC5C42] mb-2">
                Our Mission
              </h2>
              <p className="text-gray-600">
                To simplify the job search process by creating a seamless and 
                user-friendly platform that empowers individuals to find jobs 
                that match their skills, passion, and goals.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow hover:shadow-md transition">
              <h2 className="text-xl font-semibold text-[#EC5C42] mb-2">
                Our Vision
              </h2>
              <p className="text-gray-600">
                To be the go-to career platform in Africa, bridging the gap 
                between talented professionals and forward-thinking employers.
              </p>
            </div>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#3C1414]">What We Offer</h2>
          </div>
          <div className="grid grid-cols-1  gap-8">
            <div className="p-6 bg-white rounded-2xl shadow">
              <h3 className="text-lg text-[#EC5C42] font-semibold mb-2">For Job Seekers</h3>
              <p className="text-gray-600">
                Discover thousands of opportunities, apply with ease, and 
                track your applications all in one place.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow">
              <h3 className="text-lg text-[#EC5C42] font-semibold  mb-2">For Employers</h3>
              <p className="text-gray-600">
                Post jobs, find top talent, and manage recruitment more 
                efficiently with powerful tools designed for growth.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow">
              <h3 className="text-lg text-[#EC5C42] font-semibold mb-2">Community</h3>
              <p className="text-gray-600">
                Join a growing network of professionals, share knowledge, 
                and stay updated with the latest career trends.
              </p>
            </div>
          </div>
        </MaxWidthContainer>
      </section>
   
  )
}
