"use client";
import { useState } from "react";
import MaxWidthContainer from "../things-to-share/max-width-container";
import { Navs } from "../../constants/datanav";
import Link from "next/link";
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react";


export default function Navbar() {
   const [isOpen, setIsOpen] = useState(false);
  return (
    <header className=" bg-[#3C1414] relative">
        <MaxWidthContainer className="py-6 flex justify-between items-center text-[#FFF1F0]">
                <Link href={"/"}>
                 <h1 className="font-black lg:text-5xl text-4xl px-4 cursor-pointer hover:text-[#EC5C42]">JobZ</h1>
                </Link>
            <nav className="hidden lg:block">
                <ul className="flex lg:gap-16 text-lg font-medium">
                  {Navs.map((link, index) => (
                       <li key={index}>
                         <Link href={`/${link.href}`}
                           className="hover:text-[#EC5C42] hover:text-lg">
                         
                            {link.title}
                         </Link>
                       </li>
                  ))}
                </ul>
             </nav>
                <div className="hidden lg:block">
                  <Link href={"/jobs"}>
                      <Button className={" p-6 rounded-2xl bg-[#EC5C42] hover:bg-[#d84f39] text-white"}>
                         Find Jobs
                     </Button>
                  </Link>
                </div>

                <Button className={'lg:hidden mr-4 bg-[#EC5C42] hover:bg-[#d84f39]'}
                 onClick={() => setIsOpen(!isOpen)}> 
                 {isOpen ? <X size={28} /> : <Menu size={28} />}

                </Button>
         </MaxWidthContainer>   

                {isOpen && (
                  <nav className="absolute top-20 left-0 w-full bg-[#3C1414] text-[#FFF1F0] py-6 md:hiddn z-10">
                    <ul className="flex flex-col items-center gap-6 text-lg font-medium">
                      {Navs.map((link, index) => (
                        <li key={index}>
                          <Link href={`/${link.href}`}
                          className="hover:text-[#EC5C42] hover:text-lg"
                          onClick={() => setIsOpen(false)}
                          >
                            {link.title}
                          </Link>
                        </li>
                      ))}
                      <Link href={"/jobs"}>
                        <Button className="bg-[#EC5C42] hover:bg-[#d84f39] text-white">
                          Find Jobs
                        </Button>
                      </Link>
                    </ul>
                  </nav>
                )}
                
    </header>
  )
}
