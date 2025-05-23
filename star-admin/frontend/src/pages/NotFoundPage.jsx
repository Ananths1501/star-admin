import { Link } from "react-router-dom"
import { Home, AlertTriangle } from "lucide-react"

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gradient-blue via-gradient-purple to-gradient-red px-4">
      <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-2xl border border-white/20 max-w-md w-full animate-fade-in">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center shadow-gradient-glow">
            <AlertTriangle size={40} className="text-white" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-white animate-pulse">404</h1>
        <h2 className="text-2xl font-semibold mt-4 text-white">Page Not Found</h2>
        <p className="mt-2 text-white/80">The page you are looking for doesn't exist or has been moved.</p>
        <div className="mt-8">
          <Link
            to="/"
            className="bg-white/20 py-2 px-6 rounded-md text-white flex items-center justify-center mx-auto w-max transition-all duration-300 hover:bg-white/30 hover:shadow-gradient-glow hover:scale-105 active:scale-95 border border-white/30"
          >
            <Home size={18} className="mr-2" /> Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
