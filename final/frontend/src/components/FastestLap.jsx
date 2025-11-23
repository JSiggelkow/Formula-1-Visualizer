import { useState, useEffect } from "react";
import {
  Card,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  Loader,
  Alert,
} from "@mantine/core";
import api from "../api";
import PaginatedTable from "./PaginatedTable";

const FastestLap = ({ raceId, circuitId }) => {
  const [lapsData, setLapsData] = useState([]);
  const [raceName, setRaceName] = useState("");
  const [circuitName, setCircuitName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("FastestLap props:", { raceId, raceName, circuitId, circuitName });

  useEffect(() => {
    fetchFastestLaps();
  }, [raceId, circuitId]);

  const fetchFastestLaps = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!raceId && !circuitId) {
        setLapsData([]);
        return;
      }

      const query = raceId ? `?race_id=${raceId}` : `?circuit_id=${circuitId}`;
      const res = await api.get(`/fastest-lap${query}`);
      // Backend returns an array of rows
      setLapsData(Array.isArray(res.data) ? res.data : []);

      if (raceId && res.data.length > 0) {
        setRaceName(res.data[0].race_name);
      }
      if (circuitId && res.data.length > 0) {
        setCircuitName(res.data[0].circuit_name);
      }
    } catch (err) {
      console.error("Error fetching fastest laps:", err);
      setError("Failed to load fastest laps");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "driver_name", label: "Driver" },
    { key: "time", label: "Time" },
    { key: "lap", label: "Lap" },
    {
      key: "race_name",
      label: "Race",
      render: (_, row) => (
        <Stack gap={2}>
          <Text size="sm" fw={500}>
            {row.race_name} ({row.year})
          </Text>
          <Text size="xs" c="dimmed">
            {row.date ? new Date(row.date).toLocaleDateString() : "-"}
          </Text>
        </Stack>
      ),
    },
    {
      key: "circuit_name",
      label: "Circuit",
      render: (_, row) => (
        <Stack gap={2}>
          <Text size="sm" fw={500}>
            {row.circuit_name}
          </Text>
          <Text size="xs" c="dimmed">
            {row.circuit_city}, {row.circuit_country}
          </Text>
        </Stack>
      ),
    },
  ];

  if (loading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="center" p="xl">
          <Loader size="lg" />
          <Text>Loading fastest lap...</Text>
        </Group>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert title="Error" color="red">
        {error}
      </Alert>
    );
  }

  if (!lapsData || lapsData.length === 0) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text c="dimmed" ta="center" py="xl">
          No fastest lap data found for the selected {raceId ? "race" : "circuit"}.
        </Text>
      </Card>
    );
  }

  return (
    <Stack gap="lg">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" align="center">
          <Title order={2} c="red.5">
            Fastest Lap - {raceId ? `${raceName}` : `${circuitName}`}
          </Title>
        </Group>

        <Text size="sm" c="dimmed" mt="sm">
          Fastest lap(s) for the selected {raceId ? "race" : "circuit"}.
        </Text>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <PaginatedTable title="Fastest Laps" data={lapsData} columns={columns} />
      </Card>
    </Stack>
  );
};

export default FastestLap;
