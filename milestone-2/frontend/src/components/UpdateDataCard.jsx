import { useState } from "react";
import { Button, Card, Text, Title, Loader, Group, List } from "@mantine/core";
import "./Card.css";

const UpdateDataCard = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/get-next-race");
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to fetch update result");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card bg="white" className="action-card" p="xl">
      <Title size="h3" c="red.6" mb="sm">
        Update Database
      </Title>
      <Text c="gray.7" mb="lg">
        Fetch and insert data for the next available race.
      </Text>

      <Button
        color="red.5"
        onClick={handleUpdate}
        disabled={loading}
        mt="sm"
        h="3rem"
      >
        {loading ? <Loader size="sm" color="white" /> : "Get Next Race"}
      </Button>

      {/* Result Section */}
      {result && (
        <Card shadow="xs" mt="xl" p="md">
          {result.year && result.round ? (
            <Title order={4} mb="sm">
              Added Race: {result.year} Round {result.round}
            </Title>
          ) : (
            <Title order={4} mb="sm" c="gray.6">
              No new races found.
            </Title>
          )}

          <List spacing="xs">
            {result.circuits_added > 0 && (
              <List.Item>🏎️ Circuits added: {result.circuits_added}</List.Item>
            )}
            {result.races_added > 0 && (
              <List.Item>🏁 Races added: {result.races_added}</List.Item>
            )}
            {result.drivers_added > 0 && (
              <List.Item>👨‍✈️ Drivers added: {result.drivers_added}</List.Item>
            )}
            {result.constructors_added > 0 && (
              <List.Item>🏢 Constructors added: {result.constructors_added}</List.Item>
            )}
            {result.results_added > 0 && (
              <List.Item>📊 Results added: {result.results_added}</List.Item>
            )}
            {result.status_added > 0 && (
              <List.Item>⚙️ Statuses added: {result.status_added}</List.Item>
            )}
            {result.laptimes_added > 0 && (
              <List.Item>⏱️ Laptimes added: {result.laptimes_added}</List.Item>
            )}
          </List>
        </Card>
      )}

      {/* Error Section */}
      {error && (
        <Text c="red.6" mt="md">
          ⚠️ {error}
        </Text>
      )}
    </Card>
  );
};

export default UpdateDataCard;
