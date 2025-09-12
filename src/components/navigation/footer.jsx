import React from 'react'

export default function Footer() {
    const year = new Date().getFullYear() 
  return (
    <footer className='space-y-4 py-4 font-bold text-center text-xl bg-[#FDF6E3]  text-[#EC5C42]'>
        <p>Created by DevAndi</p>
       <p> &copy; {year} </p>
    </footer>
  )
}
