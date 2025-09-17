import MaxWidthContainer from "../things-to-share/max-width-container";
import { Navs } from "../../../constants/datanav";
import Link from "next/link";
import { Button } from "../ui/button";


export default function Navbar() {
  return (
    <header className=" bg-[#3C1414]">
        <MaxWidthContainer className="py-6 flex md:justify-between items-center text-[#FFF1F0]">
                <Link href={"/"}>
                 <h1 className="font-black text-5xl cursor-pointer">JobZ</h1>
                </Link>
            <nav>
                <ul className="flex md:gap-15 text-lg font-medium">
                  {Navs.map((link, index) => (
                       <li key={index}>
                         <Link href={`/${link.href}`}
                           className="hover:text-[#3C1414] hover:text-lg">
                         
                            {link.title}
                         </Link>
                       </li>
                  ))}
                </ul>
             </nav>

              <Button className={"bg-[#EC5C42] text-white w-24  font-bold h-12 rounded-2xl hover:text-white hover:bg-[#3C1414] shadow-accent-foreground cursor-pointer"}>Post Job</Button>
              
              
  



        </MaxWidthContainer>   
    </header>
  )
}
