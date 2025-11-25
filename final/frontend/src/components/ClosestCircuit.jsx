import { useState } from 'react';
import { Box, Button, Card, TextInput, Title, Text, Alert, Stack, Group } from '@mantine/core';

function ClosestCircuits() {
  const [city, setCity] = useState('');
  const [circuits, setCircuits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!city.trim()) {
      setError('Please enter a location (e.g., Address/City/Country)');
      return;
    }

    setLoading(true);
    setError('');
    
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
      
      const response = await fetch(`/api/circuits/closest?userLat=${userLat}&userLng=${userLng}`);
      
      if (!response.ok) {
        throw new Error(`Closest circuit backend error: ${response.status}`);
      }
      
      const data = await response.json();
      
      setCircuits(data.circuits || []);
    } catch (err) {
      setError('Something went wrong. Please try again.');
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
    <Box>
      <Stack gap="xl">
        <Box>
          <Title order={2} c="gray.1" mb="sm">
            Find Closest F1 Circuits
          </Title>
          <Text c="gray.5" size="sm">
            Enter a location to discover the nearest Formula 1 circuits
          </Text>
        </Box>

        <Group>
          <TextInput
            placeholder="Enter a location (Address/City/Country, e.g. Toronto)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyPress}
            style={{ flex: 1 }}
            size="md"
          />
          <Button 
            onClick={handleSearch} 
            disabled={loading}
            color="red.5"
            size="md"
          >
            {loading ? 'Searching...' : 'Find Circuits'}
          </Button>
        </Group>

        {error && (
          <Alert title="Error" color="red">
            {error}
          </Alert>
        )}

        {circuits && circuits.length > 0 && (
          <Box>
            <Title order={3} c="gray.1" mb="md">
              Closest Circuits to {city}
            </Title>
            <Stack gap="md">
              {circuits.map((circuit) => (
                <Card key={circuit.circuitId || Math.random()} bg="gray.8" padding="lg" radius="md" withBorder>
                  <Stack gap="sm">
                    <Title order={4} c="red.5">
                      {circuit.name || 'Unknown Circuit'}
                    </Title>
                    
                    <Group gap="xl">
                      <Text c="gray.3" size="sm">
                        <Text component="span" fw={600} c="gray.1">Location:</Text> {circuit.city || 'N/A'}, {circuit.country || 'N/A'}
                      </Text>
                      <Text c="gray.3" size="sm">
                        <Text component="span" fw={600} c="gray.1">Distance:</Text> {circuit.distance_km ? `${circuit.distance_km} km` : 'N/A'} away
                      </Text>
                    </Group>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export default ClosestCircuits;
