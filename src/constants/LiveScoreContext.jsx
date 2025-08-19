import { createContext, useContext, useState, useEffect } from "react"

const LiveScoreContext = createContext()

export const useLiveScore = () => {
  const context = useContext(LiveScoreContext)
  if (!context) {
    throw new Error("useLiveScore must be used within a LiveScoreProvider")
  }
  return context
}

export const LiveScoreProvider = ({ children }) => {
  const [liveScoreSettings, setLiveScoreSettings] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("liveScoreSettings")
      if (savedSettings) {
        setLiveScoreSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error("Error loading live score settings:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(
        "liveScoreSettings",
        JSON.stringify(liveScoreSettings)
      )
    }
  }, [liveScoreSettings, isLoading])

  const updateEventLiveStatus = (eventId, isLive) => {
    console.log(
      `LiveScore Context: Setting event ${eventId} live status to ${isLive}`
    )

    setLiveScoreSettings((prev) => {
      const newSettings = {
        ...prev,
        [eventId]: {
          ...prev[eventId],
          isLive,
          resultsReleased: false,
          lastUpdated: new Date().toISOString(),
          isLegacyEvent: false,
          manuallyManaged: true,
        },
      }
      return newSettings
    })
  }

  const updateEventResults = (eventId, resultsData) => {
    setLiveScoreSettings((prev) => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        liveResults: resultsData,
        lastUpdated: new Date().toISOString(),
        isLegacyEvent: false,
      },
    }))
  }

  const releaseResults = (eventId) => {
    setLiveScoreSettings((prev) => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        resultsReleased: true,
        isLive: false, // Stop live scoring when results are released
        releasedAt: new Date().toISOString(),
        isLegacyEvent: false,
      },
    }))
  }

  const getEventStatus = (eventId, eventDate = null) => {
    const eventSettings = liveScoreSettings[eventId]

    // If we have manual settings, use them
    if (eventSettings) {
      return {
        isLive: eventSettings.isLive || false,
        resultsReleased: eventSettings.resultsReleased || false,
        liveResults: eventSettings.liveResults || [],
        lastUpdated: eventSettings.lastUpdated || null,
        releasedAt: eventSettings.releasedAt || null,
        isLegacyEvent: eventSettings.isLegacyEvent || false,
        manuallyManaged: eventSettings.manuallyManaged || false,
      }
    }

    // Default behavior for events with no settings - auto-release past events
    if (eventDate) {
      const eventDateObj = new Date(eventDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      eventDateObj.setHours(0, 0, 0, 0)

      const isPastEvent = eventDateObj < today

      if (isPastEvent) {
        return {
          isLive: false,
          resultsReleased: false,
          liveResults: [],
          lastUpdated: null,
          isLegacyEvent: true,
          manuallyManaged: false,
        }
      }
    }

    // For future events or events without date
    return {
      isLive: false,
      resultsReleased: false,
      liveResults: [],
      lastUpdated: null,
      isLegacyEvent: false,
      manuallyManaged: false,
    }
  }

  const markEventAsLegacy = (eventId) => {
    setLiveScoreSettings((prev) => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        resultsReleased: true,
        isLive: false,
        isLegacyEvent: true,
        lastUpdated: new Date().toISOString(),
      },
    }))
  }

  const resetEvent = (eventId) => {
    setLiveScoreSettings((prev) => {
      const newSettings = { ...prev }
      delete newSettings[eventId]
      return newSettings
    })
  }

  return (
    <LiveScoreContext.Provider
      value={{
        liveScoreSettings,
        updateEventLiveStatus,
        updateEventResults,
        releaseResults,
        getEventStatus,
        markEventAsLegacy,
        resetEvent,
        isLoading,
      }}>
      {children}
    </LiveScoreContext.Provider>
  )
}

export default LiveScoreProvider
