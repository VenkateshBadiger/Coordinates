import React, { useState, useEffect } from 'react';
import { useGeolocated } from "react-geolocated";
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

// Fix default icon issue with Leaflet and React
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const Header = ({ toggleTheme, isDarkMode }) => {
  return (
    <header className="app-header">
      <h1>Radar Rescuer</h1>
      <p>Navigating Your Safety, One Scan at a Time</p>
      <button onClick={toggleTheme} className="theme-toggle-button">
        {isDarkMode ? "Light Mode" : "Nigga mode"}
      </button>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="app-footer">
      <p>A product by CatAssThrophics</p>
    </footer>
  );
};

const Home = ({ onStartTracking }) => {
  const handleScanForHumans = () => {
    window.open("https://colab.research.google.com/drive/1NBnr8pJBz2pH4k_iEQzsS7K7ZpfjcVZd", "_blank");
  };

  return (
    <div className="home-container">
      <h2>Welcome to Radar Rescuer</h2>
      <div className="button-container">
        <button className="start-tracking-button" onClick={onStartTracking}>Find your path</button>
        <button className="scan-humans-button" onClick={handleScanForHumans}>Scan for Humans</button>
      </div>
    </div>
  );
};

const Tracking = ({ onStopTracking, onExitTracking }) => {
  const [path, setPath] = useState([]); // Array to store path coordinates
  const [isTrackingActive, setIsTrackingActive] = useState(true); // State to manage tracking activity
  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    watchPosition: true,
    userDecisionTimeout: 2000,
  });

  // Update path coordinates when new location is received
  useEffect(() => {
    if (isTrackingActive && coords) {
      const newLat = coords.latitude;
      const newLon = coords.longitude;
      setPath(prevPath => [...prevPath, [newLat, newLon]]);
    }
  }, [coords, isTrackingActive]);

  // Stop tracking functionality
  const handleStopTracking = () => {
    setIsTrackingActive(false); // Update state to stop tracking updates
  };

  // Exit tracking functionality
  const handleExitTracking = () => {
    onExitTracking(); // Notify parent component (App) about exiting tracking
  };

  if (!isGeolocationAvailable) {
    return <div>Your browser does not support Geolocation.</div>;
  }

  if (!isGeolocationEnabled) {
    return <div>Geolocation is not enabled.</div>;
  }

  return (
    <div className="tracking-container">
      <div className="tracking-content">
        <h2>Current Location</h2>
        {coords && (
          <div className="coords-info">
            <h3>Latitude: {coords.latitude}</h3>
            <h3>Longitude: {coords.longitude}</h3>
          </div>
        )}
        <button onClick={handleStopTracking} className="stop-button">Stop Tracking</button>
        <button onClick={handleExitTracking} className="exit-button">Exit Tracking</button>

        <MapContainer center={coords ? [coords.latitude, coords.longitude] : [12.977439, 77.570839]} zoom={13} className="map-container">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {coords && <Marker position={[coords.latitude, coords.longitude]} />}
          {path.length > 1 && <Polyline positions={path} color="blue" />}
        </MapContainer>
      </div>
      <div className="coordinates-list">
        <h2>Recorded Coordinates</h2>
        <ul>
          {path.map((coordinate, index) => (
            <li key={index}>Latitude: {coordinate[0]}, Longitude: {coordinate[1]}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const App = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', !isDarkMode ? 'dark' : 'light');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  return (
    <div className="app-container">
      <Header toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      {isTracking ? (
        <Tracking onStopTracking={() => setIsTracking(true)} onExitTracking={() => setIsTracking(false)} />
      ) : (
        <Home onStartTracking={() => setIsTracking(true)} />
      )}
      <Footer />
    </div>
  );
}

export default App;
