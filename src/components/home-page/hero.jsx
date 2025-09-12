import MaxWidthContainer from "../things-to-share/max-width-container";

export default function Hero() {
  return (
   <section>
    <MaxWidthContainer className="text-center py-20 space-y-6 gap-4">
        <h1 className="text-6xl font-extrabold text-[#3C1414]">Find Your Dream Job</h1>
        <p className="text-xl text-[#3C1414]">Discover thousands of opportunities from top companies. Your next career move starts here.</p>
        <div className="h-20 flex justify-between border border-gray-300 rounded-2xl  max-w-2xl mx-auto px-2 py-2">
            <input type="text" placeholder="Search for jobs..." className="px-4 py-3 w-1/3 max-w-lg " />
            <button className="bg-[#EC5C42] text-white w-32 h-14 px-4 py-3 rounded-2xl hover:bg-[#3C1414] cursor-pointer">Search Jobs</button>
        </div>
        <div className="flex justify-center border">
         <img src="https://res.cloudinary.com/dxekfksjf/image/upload/v1757689051/characters-looking-job_aiwknq.jpg" alt="" width={"1200"} height={"1000"} className="fill object-contain"/>
        </div>
    </MaxWidthContainer>
   </section>
  )
}
