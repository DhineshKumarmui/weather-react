import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import Chart from 'chart.js/auto';
import './App.css';

export function findUserLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const url = `${process.env.REACT_APP_LOCATION_API_URL}/reverse?key=${process.env.REACT_APP_LOCATION_API_KEY}`;

        try {
          const response = await fetch(`${url}&lat=${latitude}&lon=${longitude}&format=json`);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const locData = await response.json();
          resolve({ locData, latitude, longitude });
        } catch (error) {
          console.error('Error fetching location data:', error);
          reject(error);
        }
      }, (error) => {
        console.error('Error getting location:', error);
        reject(error);
      });
    } else {
																   
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}

const TemperatureChart = ({ latitude, longitude }) => {
  const [timeValues, setTimeValues] = useState([]);
  const [temperatureValues, setTemperatureValues] = useState([]);

  const weatherAPIUrl = `${process.env.REACT_APP_WEATHER_API_URL}`;

  const fetchWeatherData = async () => {
    try {
      const response = await fetch(`${weatherAPIUrl}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&timezone=auto`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const weatherData = await response.json();
      
      setTimeValues(weatherData.hourly.time);
      setTemperatureValues(weatherData.hourly.temperature_2m);
      
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
    }
  };

  useEffect(() => {
    if (latitude && longitude) {
      fetchWeatherData();
    }
  }, [latitude, longitude]);

  const formattedTimeValues = timeValues.map(time => new Date(time));

  const data = {
    labels: formattedTimeValues,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: temperatureValues,
        borderColor: '#007bff',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        fill: true,
      }
    ]
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        min: new Date(), // Set minimum to the current time
        time: {
          unit: 'hour',
          tooltipFormat: 'MMM d, yyyy, HH:mm',
          displayFormats: {
            hour: 'MMM d, HH:mm',
          },
        },
      },
      y: {
        beginAtZero: true,
      }
    }
  };

  return (
    <div className='temperature-chart-container'>
      <h2>Weather Forecast</h2>
      <Line data={data} options={options} />
    </div>
  );
};

const CheckWeather = () => {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const weatherAPIUrl = `${process.env.REACT_APP_WEATHER_API_URL}`;

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const { locData, latitude: lat, longitude: lon } = await findUserLocation();
      setLocation(locData); // Store the location in state
      const response = await fetch(`${weatherAPIUrl}?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const weatherData = await response.json();
      setWeather(weatherData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className='check-your-weather'>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Loading...' : 'Check your weather'}
      </button>
      {error && <p className="error-message">Error: {error}</p>}
      {location && (
        <div className='display-location'>
          <h1>User Location is:</h1>
          <p>{location.display_name}</p>
        </div>
      )}
      {weather && (
        <div>
          <div className='display-weather'>
            <h1>Current weather is</h1>
            <p>Temperature: {weather.current.temperature_2m + ' ' + weather.current_units.temperature_2m}</p>
            <p>Wind Speed: {weather.current.wind_speed_10m + ' ' + weather.current_units.wind_speed_10m}</p>
          </div>
          <div>
            <TemperatureChart latitude={weather.latitude} longitude={weather.longitude} />
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <CheckWeather />
  );
};
