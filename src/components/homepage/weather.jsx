// Corrected weather.jsx component
import { useState, useEffect } from "react"
import axios from "axios"
import { getWeatherIcon } from "../../constants/weatherIcons"

const WEATHER_CACHE_KEY = "notts_alliance_weather_data"
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const STALE_WHILE_REVALIDATE_DURATION = 30 * 60 * 1000 // 30 minutes

const Weather = ({ city }) => {
  const [dailyForecast, setDailyForecast] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchWeather = async () => {
      // Declare these variables at the top of the function so they're available in all blocks
      let cacheIsValid = false
      let cacheIsStale = false
      let cachedWeatherData = null

      try {
        // Try to get data from cache
        try {
          const cachedWeather = localStorage.getItem(WEATHER_CACHE_KEY)
          if (cachedWeather) {
            const { data, timestamp, cachedCity } = JSON.parse(cachedWeather)
            const now = Date.now()

            // Check if cache is fresh
            if (now - timestamp < CACHE_DURATION && cachedCity === city) {
              cacheIsValid = true
              cachedWeatherData = data
              if (isMounted) {
                setDailyForecast(data)
                setIsLoading(false)
              }
            }
            // Check if cache is stale but usable while we revalidate
            else if (
              now - timestamp <
                CACHE_DURATION + STALE_WHILE_REVALIDATE_DURATION &&
              cachedCity === city
            ) {
              cacheIsStale = true
              cachedWeatherData = data
              if (isMounted) {
                setDailyForecast(data)
                setIsLoading(false)
              }
            }
          }
        } catch (e) {
          console.warn("Error reading weather cache:", e.message)
        }

        // If cache is completely valid, we're done
        if (cacheIsValid && !cacheIsStale) {
          return
        }

        // If we have stale data, show it but continue to fetch fresh data
        // If we have no valid cache, show loading state while fetching
        if (!cacheIsStale && isMounted) {
          setIsLoading(true)
        }

        // Fetch fresh data
        const apiKey = import.meta.env.VITE_WEATHER_API_KEY
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`,
          { timeout: 5000 } // Add timeout
        )

        const weatherData = response.data.list
        const dailyData = {}

        weatherData.forEach((entry) => {
          const date = entry.dt_txt.split(" ")[0]
          if (!dailyData[date]) {
            dailyData[date] = {
              temp: 0,
              count: 0,
              icon: entry.weather[0].icon,
            }
          }
          dailyData[date].temp += entry.main.temp
          dailyData[date].count++
        })

        const forecast = Object.keys(dailyData).map((date) => ({
          date,
          temp: Math.round(
            (dailyData[date].temp / dailyData[date].count).toFixed(1)
          ),
          icon: dailyData[date].icon,
        }))

        const forecastData = forecast.slice(0, 3)

        // Cache the fresh data
        try {
          localStorage.setItem(
            WEATHER_CACHE_KEY,
            JSON.stringify({
              data: forecastData,
              timestamp: Date.now(),
              cachedCity: city,
            })
          )
        } catch (e) {
          console.warn("Error saving weather cache:", e.message)
        }

        if (isMounted) {
          setDailyForecast(forecastData)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error fetching weather data:", error)

        // If we have cached data, use it even if it's stale in case of error
        if (cachedWeatherData && isMounted) {
          setDailyForecast(cachedWeatherData)
        } else if (isMounted) {
          setError(error)
        }

        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchWeather()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [city])

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const options = { weekday: "short", day: "numeric" }
    return date.toLocaleDateString(undefined, options)
  }

  if (isLoading) {
    return (
      <div className="flex place-content-center h-[50px] w-auto z-10 drop-shadow-2xl">
        <div className="flex text-white items-center justify-center opacity-70">
          <div className="mx-4 text-center">
            <div className="flex items-center justify-center">
              <div className="text-white text-sm">
                <div className="animate-pulse bg-white bg-opacity-20 h-4 w-16 rounded"></div>
                <div className="animate-pulse bg-white bg-opacity-20 h-4 w-12 mt-1 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex place-content-center h-[50px] w-auto z-10 drop-shadow-2xl">
        <div className="flex text-white items-center justify-center opacity-80">
          <span>Weather currently unavailable</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex place-content-center h-[50px] w-auto z-10 drop-shadow-2xl">
      <div className="flex text-white items-center justify-center">
        {dailyForecast.length > 0
          ? dailyForecast.map((day, index) => (
              <div key={index} className="mx-4 text-center">
                <div className="flex items-center justify-center mr-1">
                  <span className="weather-icon text-2xl [text-shadow:_2px_3px_2px_rgb(0_0_0_/_60%)]">
                    {getWeatherIcon(day.icon)}
                  </span>
                  <div className="text-white text-sm ml-1 md:ml-2">
                    <div>{formatDate(day.date)}</div>
                    <div className="">{day.temp}°C</div>
                  </div>
                </div>
              </div>
            ))
          : ""}
      </div>
    </div>
  )
}

export default Weather
