import { Button, Card, Text, NumberInput, Title } from "@mantine/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Card.css";

const SeasonWinnersCard = () => {
  const [year, setYear] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (year) {
      navigate(`/race-wins/${year}`);
    }
  };

  return (
    <Card bg="white" className="action-card" p="xl">
      <Title size="h3" c="red.6" mb="sm">
        Season Winners
      </Title>
      <Text c="gray.7" mb="lg">
        Find all race winners from a specific season
      </Text>
      <NumberInput
        value={year}
        onChange={(value) => setYear(value)}
        placeholder="Enter Year (e.g., 2023)"
        min={1950}
        max={new Date().getFullYear()}
        classNames={{
            input: "input"
        }}
      />
      <Button
        type="submit"
        color="red.5"
        onClick={handleSubmit}
        mt="xl"
        h="3rem"
      >
        Show Winners
      </Button>
    </Card>
  );
};

export default SeasonWinnersCard;
