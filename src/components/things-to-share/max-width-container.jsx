

export default function MaxWidthContainer({className, children}) {
  return (
    <div className={`max-w-[1240px] mx-auto ${className}`}>
        {children}
    </div>
  )
}
