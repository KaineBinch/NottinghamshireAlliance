import { useState, useEffect } from "react"
import axios from "axios"
import { getWeatherIcon } from "../../constants/weatherIcons"

const WEATHER_CACHE_KEY = "notts_alliance_weather_data"
const CACHE_DURATION = 24 * 60 * 60 * 1000

const Weather = ({ city }) => {
  const [dailyForecast, setDailyForecast] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const cachedData = localStorage.getItem(WEATHER_CACHE_KEY)

        if (cachedData) {
          const { data, timestamp, cachedCity } = JSON.parse(cachedData)
          const now = Date.now()

          if (now - timestamp < CACHE_DURATION && cachedCity === city) {
            setDailyForecast(data)
            setIsLoading(false)
            return
          }
        }

        const apiKey = import.meta.env.VITE_WEATHER_API_KEY
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
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

        localStorage.setItem(
          WEATHER_CACHE_KEY,
          JSON.stringify({
            data: forecastData,
            timestamp: Date.now(),
            cachedCity: city,
          })
        )

        setDailyForecast(forecastData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching weather data:", error)
        setIsLoading(false)

        try {
          const cachedData = localStorage.getItem(WEATHER_CACHE_KEY)
          if (cachedData) {
            const { data } = JSON.parse(cachedData)
            setDailyForecast(data)
          }
        } catch (e) {
          console.error("Error reading cached weather data:", e)
        }
      }
    }

    fetchWeather()
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
