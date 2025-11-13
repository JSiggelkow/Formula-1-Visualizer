import {
  Button,
  Card,
  SegmentedControl,
  Select,
  Text,
  Title,
  NumberInput,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import api from "../api";
import "./Card.css";

const FastestLapCard = () => {
  const [activeTab, setActiveTab] = useState("race");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedRace, setSelectedRace] = useState("");
  const [selectedCircuit, setSelectedCircuit] = useState("");
  const [races, setRaces] = useState([]);
  const [circuits, setCircuits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCircuits();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchRacesByYear(selectedYear);
    }
  }, [selectedYear]);

  const fetchCircuits = async () => {
    try {
      const circuitsRes = await api.get("/circuits");
      const circuitOptions = circuitsRes.data.map(circuit => ({
        value: String(circuit.circuitId),
        label: circuit.name,
      }));
      circuitOptions.sort((a, b) => a.label.localeCompare(b.label));
      setCircuits(circuitOptions);
    } catch (error) {
      console.error("Error fetching circuits:", error);
    }
  };

  const fetchRacesByYear = async (year) => {
    try {
      const racesRes = await api.get(`/races?year=${year}`);
      const raceLabels = racesRes.data.map(race => ({
        value: String(race.raceId),
        label: race.name,
      }));
      raceLabels.sort((a, b) => a.label.localeCompare(b.label));
      setRaces(raceLabels);
    } catch (error) {
      console.error("Error fetching races:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (activeTab === "race" && selectedRace) {
      navigate(`/fastest-lap/race/${selectedRace}`);
    } else if (activeTab === "circuit" && selectedCircuit) {
      navigate(`/fastest-lap/circuit/${selectedCircuit}`);
    }
  };

  return (
    <Card bg="white" className="action-card" p="xl">
      <Title size="h3" c="red.6" mb="sm">
        Fastest Lap
      </Title>
      <Text c="gray.7" mb="lg">
        Find the fastest lap time for a specific race or circuit
      </Text>
      <SegmentedControl
        value={activeTab}
        onChange={setActiveTab}
        data={[
          { value: "race", label: "By Race" },
          { value: "circuit", label: "By Circuit" },
        ]}
        mb="lg"
      />
      {activeTab === "race" ? (
        <>
          <Text fz="sm" c="gray.6">
            Select Year
          </Text>
          <NumberInput
            value={selectedYear}
            onChange={(value) => setSelectedYear(value)}
            defaultValue={2023}
            placeholder="Enter Year (e.g., 2023)"
            min={1950}
            max={new Date().getFullYear()}
            mb="sm"
            classNames={{
                input: "input"
            }}
          />
          <Text fz="sm" c="gray.6">
            Select Race
          </Text>
          <Select
            value={selectedRace}
            onChange={setSelectedRace}
            data={races}
            disabled={!selectedYear || String(selectedYear).length < 4 || races.length === 0}
            classNames={{
                input: "input"
            }}
          />
        </>
      ) : (
        <>
          <Text fz="sm" c="gray.6">
            Select Circuit
          </Text>
          <Select
            value={selectedCircuit}
            onChange={setSelectedCircuit}
            data={circuits}
            classNames={{
                input: "input"
            }}
          />
        </>
      )}
      <Button
        type="submit"
        color="red.5"
        onClick={handleSubmit}
        mt="xl"
        h="3rem"
        disabled={
          (activeTab === "race" && !selectedRace) ||
          (activeTab === "circuit" && !selectedCircuit)
        }
      >
        Select Race/Circuit
      </Button>
    </Card>
  );
};

export default FastestLapCard;
