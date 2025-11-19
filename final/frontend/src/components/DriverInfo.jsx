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

const DriverInfo = ({ driverId }) => {
  const [driverData, setDriverData] = useState(null);
  const [raceResults, setRaceResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (driverId) {
      fetchDriverInfo();
    }
  }, [driverId]);

  const fetchDriverInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const [driverResponse, resultsResponse] = await Promise.all([
        api.get(`/driver?driver_id=${driverId}`),
        api.get(`/driver-race-results?driver_id=${driverId}`),
      ]);

      setDriverData(driverResponse.data[0]);
      setRaceResults(resultsResponse.data);
    } catch (error) {
      console.error("Error fetching driver info:", error);
      setError("Failed to load driver information");
    } finally {
      setLoading(false);
    }
  };

  const getPositionColor = (position) => {
    if (position === "1") return "yellow";
    if (position === "2") return "gray";
    if (position === "3") return "orange";
    if (["4", "5", "6", "7", "8", "9", "10"].includes(position)) return "blue";
    return "gray";
  };

  const raceResultsColumns = [
    {
      key: "year",
      label: "Year",
    },
    {
      key: "round",
      label: "Round",
    },
    {
      key: "circuit_name",
      label: "Circuit",
      render: (value, row) => (
        <Stack gap={2}>
          <Text size="sm" fw={500}>
            {row.circuit_name}
          </Text>
          <Text size="xs" c="dimmed">
            {row.city}, {row.country}
          </Text>
        </Stack>
      ),
    },
    {
      key: "constructor_name",
      label: "Constructor",
    },
    {
      key: "grid",
      label: "Grid",
    },
    {
      key: "positionText",
      label: "Position",
      render: (value) => (
        <Badge color={getPositionColor(value)} size="sm">
          {value}
        </Badge>
      ),
    },
    {
      key: "points",
      label: "Points",
    },
    {
      key: "teammate",
      label: "Teammate",
      render: (value) => value || "N/A",
    },
  ];

  if (loading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="center" p="xl">
          <Loader size="lg" />
          <Text>Loading driver information...</Text>
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

  if (!driverData) {
    return null;
  }

  return (
    <Stack gap="lg">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="flex-start" mb="md">
          <Title order={2} c="red.5">
            {driverData.forename} {driverData.surname}
          </Title>
        </Group>

        <Group gap="xl">
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              Driver Code
            </Text>
            <Text fw={600}>{driverData.code || "N/A"}</Text>
          </Stack>

          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              Nationality
            </Text>
            <Text fw={600}>{driverData.nationality}</Text>
          </Stack>

          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              Date of Birth
            </Text>
            <Text fw={600}>
              {new Date(driverData.dob).toLocaleDateString()}
            </Text>
          </Stack>
        </Group>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <PaginatedTable
          title="Race Results"
          data={raceResults}
          columns={raceResultsColumns}
        />
      </Card>
    </Stack>
  );
};

export default DriverInfo;
