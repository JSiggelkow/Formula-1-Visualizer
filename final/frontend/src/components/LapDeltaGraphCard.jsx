// src/components/LapDeltaCard.jsx
import {
  Button,
  Card,
  Text,
  Title,
  NumberInput,
  Select,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api";
import "./Card.css";

const LapDeltaCard = () => {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedRace, setSelectedRace] = useState("");
  const [races, setRaces] = useState([]);

  const navigate = useNavigate();

  // Fetch races when year changes
  useEffect(() => {
    if (selectedYear && String(selectedYear).length === 4) {
      fetchRacesByYear(selectedYear);
    }
  }, [selectedYear]);

  const fetchRacesByYear = async (year) => {
    try {
      const racesRes = await api.get(`/races?year=${year}`);
      const list = racesRes.data.map((race) => ({
        value: String(race.raceId),
        label: race.name,
      }));
      list.sort((a, b) => a.label.localeCompare(b.label));
      setRaces(list);
    } catch (error) {
      console.error("Error fetching races:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRace) {
      navigate(`/lap-delta/${selectedRace}`);
    }
  };

  return (
    <Card bg="white" className="action-card" p="xl">
      <Title size="h3" c="red.6" mb="sm">
        Lap Delta Graph
      </Title>

      <Text c="gray.7" mb="lg">
        Compare lap-to-lap deltas for all drivers in any race
      </Text>

      {/* Year input */}
      <Text fz="sm" c="gray.6">
        Select Year
      </Text>
      <NumberInput
        value={selectedYear}
        onChange={(value) => setSelectedYear(value)}
        placeholder="e.g., 2023"
        min={1950}
        max={new Date().getFullYear()}
        mb="sm"
        classNames={{ input: "input" }}
      />

      {/* Race selection */}
      <Text fz="sm" c="gray.6">
        Select Race
      </Text>
      <Select
        value={selectedRace}
        onChange={setSelectedRace}
        data={races}
        disabled={!selectedYear || races.length === 0}
        classNames={{ input: "input" }}
      />

      {/* Submit button */}
      <Button
        type="submit"
        color="red.5"
        onClick={handleSubmit}
        mt="xl"
        h="3rem"
        disabled={!selectedRace}
      >
        View Lap Delta Graph
      </Button>
    </Card>
  );
};

export default LapDeltaCard;
