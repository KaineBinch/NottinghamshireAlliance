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
          resultsReleased: false, // Reset results when starting live
          lastUpdated: new Date().toISOString(),
          isLegacyEvent: false,
          manuallyManaged: true,
          autoStarted: isLive, // Track if this was auto-started
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
    console.log(`LiveScore Context: Finishing event ${eventId}`)

    setLiveScoreSettings((prev) => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        resultsReleased: true,
        isLive: false, // Stop live scoring when results are released
        releasedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        isLegacyEvent: false,
        finished: true,
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
        autoStarted: eventSettings.autoStarted || false,
        finished: eventSettings.finished || false,
      }
    }

    // For events without settings, determine status based on date
    if (eventDate) {
      const eventDateObj = new Date(eventDate)
      const today = new Date()

      // Set both dates to start of day for comparison
      today.setHours(0, 0, 0, 0)
      eventDateObj.setHours(0, 0, 0, 0)

      const isToday = eventDateObj.getTime() === today.getTime()
      const isPastEvent = eventDateObj < today
      const isFutureEvent = eventDateObj > today

      if (isToday) {
        // Today's events should be ready to auto-start
        return {
          isLive: false,
          resultsReleased: false,
          liveResults: [],
          lastUpdated: null,
          isLegacyEvent: false,
          manuallyManaged: false,
          autoStarted: false,
          finished: false,
        }
      }

      if (isPastEvent) {
        // Past events are considered legacy/finished
        return {
          isLive: false,
          resultsReleased: false, // Don't auto-release, let user decide
          liveResults: [],
          lastUpdated: null,
          isLegacyEvent: true,
          manuallyManaged: false,
          autoStarted: false,
          finished: false,
        }
      }

      if (isFutureEvent) {
        // Future events are not ready
        return {
          isLive: false,
          resultsReleased: false,
          liveResults: [],
          lastUpdated: null,
          isLegacyEvent: false,
          manuallyManaged: false,
          autoStarted: false,
          finished: false,
        }
      }
    }

    // Default status for events without date
    return {
      isLive: false,
      resultsReleased: false,
      liveResults: [],
      lastUpdated: null,
      isLegacyEvent: false,
      manuallyManaged: false,
      autoStarted: false,
      finished: false,
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
    console.log(`LiveScore Context: Resetting event ${eventId}`)

    setLiveScoreSettings((prev) => {
      const newSettings = { ...prev }
      delete newSettings[eventId]
      return newSettings
    })
  }

  // Helper function to check if an event should auto-start today
  const shouldAutoStartToday = (eventId, eventDate) => {
    const eventSettings = liveScoreSettings[eventId]

    // Don't auto-start if already managed or finished
    if (
      eventSettings?.manuallyManaged ||
      eventSettings?.finished ||
      eventSettings?.resultsReleased
    ) {
      return false
    }

    if (eventDate) {
      const eventDateObj = new Date(eventDate)
      const today = new Date()

      today.setHours(0, 0, 0, 0)
      eventDateObj.setHours(0, 0, 0, 0)

      return eventDateObj.getTime() === today.getTime()
    }

    return false
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
        shouldAutoStartToday,
        isLoading,
      }}>
      {children}
    </LiveScoreContext.Provider>
  )
}

export default LiveScoreProvider
