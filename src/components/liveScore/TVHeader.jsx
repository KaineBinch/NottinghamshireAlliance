export const TVHeader = ({ currentEventData, eventData }) => (
  <div className="relative bg-gradient-to-r from-[#214A27] via-[#2d5e34] to-[#17331B] text-white shadow-2xl">
    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
    <div className="relative px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide">
            {currentEventData?.golf_club?.clubName || "GOLF TOURNAMENT"}
          </h1>
          <div className="flex items-center justify-center space-x-4 mt-1">
            <span className="text-base md:text-lg font-medium text-green-100">
              {currentEventData?.eventType || "COMPETITION"}
            </span>
            <span className="text-green-300">•</span>
            <span className="text-base md:text-lg text-green-100">
              {currentEventData?.eventDate || eventData?.eventDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
)
