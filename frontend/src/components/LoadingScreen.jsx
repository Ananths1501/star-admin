"use client"

import { useEffect, useState, useRef } from "react"

const LoadingScreen = ({ onLoadingComplete }) => {
  const [videoEnded, setVideoEnded] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    // Handle video end
    const handleVideoEnd = () => {
      setVideoEnded(true)
      setTimeout(() => {
        setFadeOut(true)
        setTimeout(() => {
          if (onLoadingComplete) onLoadingComplete()
        }, 500) // Wait for fade out animation
      }, 1000) // Show spinner for 1 second after video ends
    }

    const videoElement = videoRef.current
    if (videoElement) {
      videoElement.addEventListener("ended", handleVideoEnd)

      // Fallback in case video doesn't load or play
      const timeout = setTimeout(() => {
        if (!videoEnded) handleVideoEnd()
      }, 5000)

      return () => {
        videoElement.removeEventListener("ended", handleVideoEnd)
        clearTimeout(timeout)
      }
    }
  }, [onLoadingComplete, videoEnded])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-primary transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      <div className="w-full max-w-md">
        {!videoEnded ? (
          <video ref={videoRef} className="w-full h-auto" autoPlay muted playsInline src="/star.mp4">
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-medium text-white">Loading Star Electricals...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoadingScreen
