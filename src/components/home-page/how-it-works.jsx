import MaxWidthContainer from "../things-to-share/max-width-container"
import { BriefcaseBusiness, Users, Star, ChartNoAxesCombined } from "lucide-react"



export default function HowItWorks() {
  return (
   <section className="bg-[#FFF8F0] ">
    <MaxWidthContainer className="text-center py-20 space-y-12">

        <div className="grid md:grid-cols-2 grid-cols-1 gap-8 items-center border rounded-2xl bg-gray-100 shadow-2xl px-6 md:px-8 py-12">
            <div className="flex justify-center rounded-2xl">
               <img src="https://res.cloudinary.com/dxekfksjf/image/upload/v1758118561/women_in_tech_cover_c2080a7fc7_j3wc4t.webp" alt="a woman with a laptop "  className="w-full max-w-md md:max-w-lg object cover rounded-xl " />
           </div>
           <div className="space-y-6 text-center md:text-left px-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#3C1414]">How It Works</h1>
                  <p className=" text-base md:text-lg text-gray-700 leading-relaxed"> Finding your next opportunity should not feel like a full-time job. <br className="hidden md:block" />That is why our platform was built with simplicity and efficiency in mind. <br className="hidden md:block"/> Whether you are a job seeker searching for your dream role or an employer looking for the right talent, <br className="hidden md:block"/> our process makes it easy, transparent, and stress-free.</p>
           </div>
        </div>

            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16 gap-12 mt-10 border rounded-2xl bg-gray-100 shadow-2xl p-6 md:p-8">
                <div className="md:text-left text-center space-y-2">
                    <h3 className="md:text-xl  text-lg font-semibold text-[#EC5C42]">Search Jobs Instantly</h3>
                    <p className="text-sm md:text-base text-gray-600" >Browse through thousands of job openings tailored to your skills, location, and career goals — no long forms or complicated steps.</p>
                </div>
                <div className="md:text-left text-center space-y-2">
                    <h3 className="md:text-xl text-lg font-semibold text-[#EC5C42]">Connect with Employers</h3>
                    <p className="text-sm md:text-base">Verified companies list their openings directly on our platform, so you can apply confidently knowing every listing is legit.</p>
                </div>
                <div className="md:text-left text-center space-y-2">
                    <h3 className="md:text-xl text-lg  font-semibold text-[#EC5C42]">Track Your Applications</h3>
                    <p className="text-sm md:text-base">Stay organized by keeping an eye on the roles you have applied for, with updates that help you know exactly where you stand.</p>
                </div>
                <div className="md:text-left text-center space-y-2">
                    <h3 className="md:text-xl text-lg  font-semibold text-[#EC5C42]">Grow Your Career</h3>
                    <p className="text-sm md:text-base">With access to top employers, success stories, and career resources, you are always one step closer to your next big opportunity.</p>
                </div>
            
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-14">
            <div className="flex flex-col items-center space-y-3 p-6 bg-white shadow-md rounded-2xl hover:shadow-xl transition"> 
                <div className="bg-[#EC5C42] flex justify-center h-14 w-14 border rounded-full items-center"><BriefcaseBusiness color="white" /></div>
                <h2 className="md:text-2xl text-xl font-bold text-[#3C1414]">1800+</h2>
                <p className="text-sm md:text-base text-gray-600">Active Jobs</p>
            </div>
            <div className="flex flex-col items-center space-y-3 p-6 bg-white shadow-md rounded-2xl hover:shadow-xl transition">
                <div className="bg-[#EC5C42] flex justify-center h-12 w-12 border rounded-full items-center" ><Users color="white"/></div>
                <h2 className="md:text-2xl text-xl font-bold text-[#3C1414]">750+</h2>
                <p className="text-sm md:text-base">Companies</p>
            </div>
            <div className="flex flex-col items-center space-y-3 p-6 bg-white shadow-md rounded-2xl hover:shadow-xl transition">
                <div className="bg-[#EC5C42] flex justify-center h-12 w-12 border rounded-full items-center" ><ChartNoAxesCombined color="white"/></div>
                <h2 className="md:text-2xl text-xl font-bold text-[#3C1414]">95%</h2>
                <p className="text-sm md:text-base">Success Rate</p>
            </div>
            <div className="flex flex-col items-center space-y-3 p-6 bg-white shadow-md rounded-2xl hover:shadow-xl transition">
                <div className="bg-[#EC5C42] flex justify-center h-12 w-12 border rounded-full items-center" ><Star color="white" /></div>
                <h2 className="md:text-2xl text-xl font-bold text-[#3C1414]">4.8</h2>
                <p className="text-sm md:text-base">User Rating</p>
            </div>
            
        </div>
      </MaxWidthContainer>  
   </section>
  )
}
