import { X, Play, Pause } from "lucide-react"

export const TVControls = ({ onExit, isScrolling, onScrollToggle }) => (
  <>
    <button
      onClick={onExit}
      className="fixed top-6 right-6 z-[10000] bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-full shadow-2xl transition-all duration-300 backdrop-blur-sm border border-red-400/30"
      title="Exit TV View (ESC)">
      <X className="w-5 h-5" />
    </button>
    <button
      onClick={onScrollToggle}
      className="fixed top-6 right-20 z-[10000] bg-blue-500/90 hover:bg-blue-600 text-white p-2 rounded-full shadow-2xl transition-all duration-300 backdrop-blur-sm border border-blue-400/30"
      title={isScrolling ? "Stop Scrolling" : "Start Scrolling"}>
      {isScrolling ? (
        <Pause className="w-5 h-5" />
      ) : (
        <Play className="w-5 h-5" />
      )}
    </button>
  </>
)
