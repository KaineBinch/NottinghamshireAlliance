import { useState, useEffect } from "react";
import axios from "axios";
import { getWeatherIcon } from "../../constants/weatherIcons";

const Weather = ({ city }) => {
  const [dailyForecast, setDailyForecast] = useState([]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );

        const weatherData = response.data.list;
        const dailyData = {};

        weatherData.forEach((entry) => {
          const date = entry.dt_txt.split(" ")[0];
          if (!dailyData[date]) {
            dailyData[date] = {
              temp: 0,
              count: 0,
              icon: entry.weather[0].icon,
            };
          }
          dailyData[date].temp += entry.main.temp;
          dailyData[date].count++;
        });

        const forecast = Object.keys(dailyData).map((date) => ({
          date,
          temp: Math.round(
            (dailyData[date].temp / dailyData[date].count).toFixed(1)
          ),
          icon: dailyData[date].icon,
        }));

        setDailyForecast(forecast.slice(0, 3));
      } catch (error) {
        console.error("Error fetching the weather data:", error);
      }
    };

    fetchWeather();
  }, [city]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { weekday: "short", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex place-content-center h-[50px] w-auto z-10 drop-shadow-2xl">
      <div className="flex text-white items-center justify-center">
        {dailyForecast.length > 0
          ? dailyForecast.map((day, index) => (
              <div key={index} className="mx-4 text-center">
                <div className="flex items-center justify-center mr-4">
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
          : "Loading..."}
      </div>
    </div>
  );
};

export default Weather;
