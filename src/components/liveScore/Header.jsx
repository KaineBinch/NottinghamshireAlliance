import { Monitor } from "lucide-react"

export const Header = ({ currentEventData, eventData, onTvViewToggle }) => (
  <header className="relative bg-gradient-to-r from-[#214A27] via-[#2d5e34] to-[#17331B] text-white rounded-lg mb-4 shadow-lg overflow-hidden">
    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
    <button
      onClick={onTvViewToggle}
      className="absolute top-3 right-3 z-10 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg shadow-md transition-all duration-300 flex items-center gap-2 text-sm backdrop-blur-sm border border-white/20"
      title="Switch to TV View for large displays">
      <Monitor className="w-4 h-4" />
      TV View
    </button>
    <div className="relative px-6 py-4">
      <div className="text-center">
        <h1 className="text-xl md:text-2xl font-bold mb-1">
          {currentEventData?.golf_club?.clubName || "GOLF TOURNAMENT"}
        </h1>
        <div className="flex items-center justify-center space-x-3 text-sm text-green-100">
          <span>{currentEventData?.eventType || "Competition"}</span>
          <span>•</span>
          <span>{currentEventData?.eventDate || eventData?.eventDate}</span>
        </div>
      </div>
    </div>
  </header>
)
