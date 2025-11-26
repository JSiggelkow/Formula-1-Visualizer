import {Box, Flex, Text, Title} from "@mantine/core";

import DriverSearchBar from "../components/DriverSearchBar";
import FastestLapCard from "../components/FastestLapCard";
import SeasonWinnersCard from "../components/SeasonWinnersCard";
import UpdateDataCard from "../components/UpdateDataCard"
import TeammateGraphCard from "../components/TeammateGraphCard"
import TriviaCard from "../components/TriviaCard.jsx";
import LapDeltaCard from "../components/LapDeltaGraphCard"

const HomePage = () => {
    return (
        <Box p="xl" bg="gray.9" mih="100vh">
            <Flex direction="column" align="center" mb="4rem" gap="sm">
                <Title size="h1" c="red.5">
                    F1 Stats Engine
                </Title>
                <Text size="lg" c="gray.5" mb="xl">
                    The Data Behind the Drive
                </Text>
                <DriverSearchBar/>
            </Flex>
            <Flex justify="center" wrap="wrap" gap="xl">
                <SeasonWinnersCard/>
                <FastestLapCard/>
                <UpdateDataCard/>
                <TeammateGraphCard/>
                <TriviaCard/>
                <LapDeltaCard />
            </Flex>
        </Box>
    );
  }

export default HomePage;
