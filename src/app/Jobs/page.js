import Navbar from "@/components/navigation/navbar";
import MaxWidthContainer from "@/components/things-to-share/max-width-container";
import Footer from "@/components/navigation/footer";
import { JobsCategories } from "../../constants/jobscategories";
import { Section } from "lucide-react";





export default function Jobs() {
    return (
        <section>
            <MaxWidthContainer>
                {JobsCategories.map((category, index) => (

                    <div key={index} className=" border-b-black w-28 h-20 flex flex-col justify-center items-center  rounded-3xl cursor-pointer hover:bg-[#EC5C42] hover:text-white">
                        <h2 className="p-4 border  rounded-3xl  ">{category.title}</h2>
                    </div>
                ))}
            
            </MaxWidthContainer>
        </section>
    )
}
