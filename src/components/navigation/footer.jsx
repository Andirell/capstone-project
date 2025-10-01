import React from 'react'

export default function Footer() {
    const year = new Date().getFullYear() 
  return (
    <footer className='space-y-4 py-6 text-center bg-[#3C1414]  text-white'>
        <p className="font-bold text-lg md:text-xl">Created by DevAndi</p>
        <p className="text-sm md:text-lg"> &copy; {year} </p>
    </footer>
  )
}
