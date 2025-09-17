import React from 'react'

export default function Footer() {
    const year = new Date().getFullYear() 
  return (
    <footer className='space-y-4 py-4 font-bold text-center text-xl bg-[#3C1414]  text-white'>
        <p>Created by DevAndi</p>
       <p> &copy; {year} </p>
    </footer>
  )
}
