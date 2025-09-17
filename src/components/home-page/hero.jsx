import MaxWidthContainer from "../things-to-share/max-width-container";

export default function Hero() {
  return (
   <section className="bg-[#FFF8F0]">
    <MaxWidthContainer className="text-center py-20 space-y-6 gap-4">
        <h1 className="text-6xl font-extrabold text-[#3C1414]">Find Your <span className="text-[#EC5C42]">Dream Job</span></h1>
        <p className="text-2xl text-[#3C1414]">Discover thousands of opportunities from top companies. <br /> Your next career move starts here.</p>
            <button className="bg-[#EC5C42] text-white w-32 h-14 px-4 py-3 rounded-2xl hover:bg-[#3C1414] cursor-pointer">Get Started</button>
        
    </MaxWidthContainer>
   </section>
  )
}
