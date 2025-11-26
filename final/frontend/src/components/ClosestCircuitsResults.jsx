import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Card, Title, Text, Stack, Group, Loader, Alert } from '@mantine/core';

const ClosestCircuitsResults = () => {
  const [searchParams] = useSearchParams();
  const [circuits, setCircuits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  useEffect(() => {
    const fetchCircuits = async () => {
      if (!lat || !lng) {
        setError('Missing location data');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/circuits/closest?userLat=${lat}&userLng=${lng}`);
        
        if (!response.ok) {
          throw new Error(`Backend error: ${response.status}`);
        }
        
        const data = await response.json();
        setCircuits(data.circuits || []);
      } catch (err) {
        setError('Failed to fetch circuits');
        console.error('Error details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCircuits();
  }, [lat, lng]);

  if (loading) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader color="red.5" size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert title="Error" color="red">
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Title order={1} c="gray.1" mb="xl">
        Closest Circuits to {city || 'Your Location'}
      </Title>

      {circuits.length === 0 ? (
        <Text c="gray.5">No circuits found</Text>
      ) : (
        <Stack gap="md">
          {circuits.map((circuit) => (
            <Card 
              key={circuit.circuitId || Math.random()} 
              bg="gray.8" 
              padding="lg" 
              radius="md" 
              withBorder
            >
              <Stack gap="sm">
                <Title order={3} c="red.5">
                  {circuit.name || 'Unknown Circuit'}
                </Title>
                
                <Group gap="xl">
                  <Text c="gray.3" size="sm">
                    <Text component="span" fw={600} c="gray.1">Location:</Text>{' '}
                    {circuit.city || 'N/A'}, {circuit.country || 'N/A'}
                  </Text>
                  <Text c="gray.3" size="sm">
                    <Text component="span" fw={600} c="gray.1">Distance:</Text>{' '}
                    {circuit.distance_km ? `${circuit.distance_km} km` : 'N/A'} away
                  </Text>
                </Group>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ClosestCircuitsResults;
