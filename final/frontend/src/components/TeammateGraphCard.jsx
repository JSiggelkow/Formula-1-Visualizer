import {
  Button,
  Card,
  Text,
  Title,
  NumberInput,
} from "@mantine/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Card.css";

const TeammateGraphCard = () => {
  const [year, setYear] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!year) return;
    navigate(`/teammate-graph/${year}`);
  };

  return (
    <Card bg="white" className="action-card" p="xl">
      <Title size="h3" c="red.6" mb="sm">
        Teammate Graph
      </Title>

      <Text c="gray.7" mb="lg">
        Generate a driver–teammate network graph for a specific season.
      </Text>

      <Text fz="sm" c="gray.6">
        Select Year
      </Text>

      <NumberInput
        value={year}
        onChange={(value) => setYear(value)}
        placeholder="Enter Year (e.g., 2022)"
        min={1950}
        max={new Date().getFullYear()}
        mb="lg"
        classNames={{ input: "input" }}
      />

      <Button
        type="submit"
        color="red.5"
        onClick={handleSubmit}
        h="3rem"
        disabled={!year || String(year).length < 4}
        fullWidth
      >
        Generate Teammate Graph
      </Button>
    </Card>
  );
};

export default TeammateGraphCard;
