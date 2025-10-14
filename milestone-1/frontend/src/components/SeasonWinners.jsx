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

const SeasonWinners = ({ year }) => {
  const [winnersData, setWinnersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (year) {
      fetchSeasonWinners();
    }
  }, [year]);

  const fetchSeasonWinners = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/race-wins?year=${year}`);
      setWinnersData(response.data);
    } catch (error) {
      console.error("Error fetching season winners:", error);
      setError("Failed to load season winners");
    } finally {
      setLoading(false);
    }
  };

  const winnersColumns = [
    {
      key: "forename",
      label: "First Name",
    },
    {
      key: "surname",
      label: "Last Name",
    },
    {
      key: "wins",
      label: "Race Wins",
      render: (value) => (
        <Badge color="yellow" size="lg" variant="filled">
          {value}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="center" p="xl">
          <Loader size="lg" />
          <Text>Loading season winners...</Text>
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

  if (winnersData.length === 0) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text c="dimmed" ta="center" py="xl">
          No race winners found for {year}
        </Text>
      </Card>
    );
  }

  return (
    <Stack gap="lg">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" align="center">
          <Title order={2} c="red.5">
            {year} Season Winners
          </Title>
          <Badge color="red.5" size="lg">
            {winnersData.length}{" "}
            {winnersData.length === 1 ? "Winner" : "Winners"}
          </Badge>
        </Group>

        <Text size="sm" c="dimmed" mt="sm">
          Race winners from the {year} Formula 1 season
        </Text>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <PaginatedTable
          title="Race Winners"
          data={winnersData}
          columns={winnersColumns}
        />
      </Card>
    </Stack>
  );
};

export default SeasonWinners;
