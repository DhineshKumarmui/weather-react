import React, { useState } from 'react';
import './App.css'

export function findUserLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const url = `https://us1.locationiq.com/v1/reverse?key=${process.env.REACT_APP_LOCATION_API_KEY}`;

        try {
          const response = await fetch(`${url}&lat=${latitude}&lon=${longitude}&format=json`);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const locData = await response.json();
          resolve({ locData, latitude, longitude }); // Resolve the promise with the location data
        } catch (error) {
          console.error('Error fetching location data:', error);
          reject(error); // Reject the promise on error
        }
      }, (error) => {
        console.error('Error getting location:', error);
        reject(error); // Reject if geolocation fails
      });
    } else {
      console.log("Geolocation is not supported by this browser.");
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}

const CheckWeather = () => {
  const [location, setLocation] = useState(null); // State to store the location
  const [weather, setWeather] = useState(null);
  const url = "https://api.open-meteo.com/v1/forecast";

  const handleClick = async () => {
    try {
      const { locData, latitude: lat, longitude: lon } = await findUserLocation();
      console.log('Location fetched on button click:', locData);
      setLocation(locData); // Store the location in state
      const response = await fetch(`${url}?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const weatherData  = await response.json();
      setWeather(weatherData)
      console.log(weatherData)
    } catch (error) {
      console.error('Failed to fetch location:', error);
    }
  };

  return (
    <div className='check-your-weather'>
      <button onClick={handleClick}>Check your weather</button>
      {location ? (
        <div className='display-location'>
        <h1>User Location is:</h1>
        <p>{location.display_name}</p>
        </div>
       ) : ''}
      {weather ? (
        <div className='display-weather'>
          <h1>Current weather is</h1>
          <p>Temperature: {weather.current.temperature_2m} °C</p>
          <p>Wind Speed: {weather.current.wind_speed_10m} km/h</p>
        </div>
      ) : (
        <p></p>
      )}
    </div>
  );
};



export default function App() {
  return (
  <CheckWeather />
  );
};
