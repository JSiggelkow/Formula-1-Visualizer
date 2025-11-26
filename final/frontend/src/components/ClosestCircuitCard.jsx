import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Text, Title, TextInput, Group } from "@mantine/core";
import "./Card.css";

const ClosestCircuitCard = () => {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!city.trim()) {
      setError("Please enter a location");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Geocode city to lat/lng using Nominatim
      const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
      const geoResponse = await fetch(geoUrl, {
        headers: {
          'User-Agent': 'F1StatsEngine/1.0'
        }
      });
      const geoData = await geoResponse.json();
      
      if (geoData.length === 0) {
        setError('Location not found. Try another search.');
        setLoading(false);
        return;
      }
      
      const userLat = geoData[0].lat;
      const userLng = geoData[0].lon;
      
      // Navigate to results page with coordinates and city name
      navigate(`/circuits?city=${encodeURIComponent(city)}&lat=${userLat}&lng=${userLng}`);
    } catch (err) {
      setError("Failed to search for location");
      console.error('Error details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card bg="white" className="action-card" p="xl">
      <Title size="h3" c="red.6" mb="sm">
        Find Closest F1 Circuits
      </Title>
      <Text c="gray.7" mb="lg">
        Enter a location to discover the nearest Formula 1 circuits
      </Text>
      <TextInput
        placeholder="Enter a location (Address/City/Country, e.g. Toronto)"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={handleKeyPress}
        size="md"
      />
      <Button 
        onClick={handleSearch} 
        disabled={loading}
        color="red.5"
        mt="sm"
        h="3rem"
        >
        {loading ? 'Searching...' : 'Find Circuits'}
      </Button>

      {/* Error Section */}
      {error && (
        <Text c="red.6" mt="md">
          ⚠️ {error}
        </Text>
      )}
    </Card>
  );
};

export default ClosestCircuitCard;
