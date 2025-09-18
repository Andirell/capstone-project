import { Button } from "../ui/button"

export default function JobCard() {
  return (
    <div className="bg-[#e9ddd0] flex flex-col justify-center items-center p-6  h-62 w-84 border  rounded-2xl gap-2">
        <h2 className="text-3xl text-gray-800 mb-2">Software Developer</h2>
        <p className=" text-2xl text-[#EC5C42] mb-2">TechNova</p>
        <div className="flex gap-4 mb-3 justify-center item center ">
        <p className=" text-gray-600 ">Lagos State</p>
        <p className=" text-gray-600 ">Remote</p>
        </div>
        <p className="text-amber-700 border p-2 flex justify-center items-center rounded-2xl">$6,000 - $10,000</p>
        <Button> View More</Button>
    </div>
  
  )
}

// {Jobs.title}
// {Jobs.company}
// {Jobs.location}
// {Jobs.salary}
// {Jobs.tags}