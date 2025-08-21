import { Trophy } from "lucide-react"

export const LoadingState = ({ isLoading, hasError, errorMessage }) => (
  <div className="text-center py-8 text-gray-500">
    <Trophy
      className={`w-12 h-12 mx-auto mb-4 text-gray-300 ${
        isLoading ? "animate-pulse" : ""
      }`}
    />
    <p className="text-lg font-medium">
      {hasError
        ? errorMessage || "Error loading data"
        : isLoading
        ? "Loading tournament data..."
        : "No clubs registered yet"}
    </p>
    <p className="text-sm">
      {hasError
        ? "Please try again later."
        : isLoading
        ? "Please wait..."
        : "Clubs will appear here once players are registered"}
    </p>
  </div>
)
