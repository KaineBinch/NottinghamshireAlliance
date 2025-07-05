import { useEffect, useRef } from "react"

const AdSense = ({ height = "250px" }) => {
  const adRef = useRef(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current || !adRef.current) {
      return
    }

    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({})
        initializedRef.current = true
        console.log("AdSense ad initialized successfully")
      } else {
        console.log("AdSense not loaded yet")
      }
    } catch (error) {
      console.error("AdSense error:", error)
    }
  }, [])

  return (
    <div className="flex justify-center bg-[#d9d9d9] w-full">
      <div className="max-w-5xl w-full">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: "block",
            width: "100%",
            height: height,
          }}
          data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID}
          data-ad-slot={import.meta.env.VITE_ADSENSE_SLOT_ID}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  )
}

export default AdSense
