import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Group } from "@mantine/core";
import DriverInfo from "../components/DriverInfo";
import SeasonWinners from "../components/SeasonWinners";
import FastestLap from "../components/FastestLap";

const InfoPage = ({ type }) => {
  const params = useParams();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/");
  };

  const renderContent = () => {
    switch (type) {
      case "driver":
        return <DriverInfo driverId={parseInt(params.driverId)} />;
      case "season-winners":
        return <SeasonWinners year={parseInt(params.year)} />;
      case "fastest-lap-by-race": {
        return <FastestLap raceId={parseInt(params.raceId)} />;
      }
      case "fastest-lap-by-circuit": {
        return <FastestLap circuitId={parseInt(params.circuitId)} />;
      }
      default:
        return <div>Unknown page type</div>;
    }
  };

  return (
    <Box size="lg" p="xl" bg="gray.9" mih="100vh">
      <Group mb="lg">
        <Button color="red.5" onClick={handleGoBack}>
          ← Back to Search
        </Button>
      </Group>

      {renderContent()}
    </Box>
  );
};

export default InfoPage;
