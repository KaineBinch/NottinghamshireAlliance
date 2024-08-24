export const getWeatherIcon = (icon) => {
  const normalizedIcon = icon.replace('n', 'd');
  const iconMap = {
    '01d': '\uf00d', // Clear sky (day)
    '02d': '\uf00c', // Few clouds (day)
    '03d': '\uf002', // Scattered clouds
    '04d': '\uf013', // Broken clouds
    '09d': '\uf01a', // Shower rain
    '10d': '\uf019', // Rain
    '11d': '\uf01d', // Thunderstorm
    '13d': '\uf076', // Snow
  };

  return iconMap[normalizedIcon] || '\uf041'; // Default to 'unknown' icon if code not found
};