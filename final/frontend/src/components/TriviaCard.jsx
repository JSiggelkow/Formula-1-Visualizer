import {
    Card,
    Text,
    Title,
    Button,
    Box,
    SimpleGrid,
    Loader,
    Center,
    Flex,
    ThemeIcon,
    Indicator
} from "@mantine/core";
import {useEffect, useState} from "react";
import axios from "axios";
import {IconFlame} from '@tabler/icons-react';

const TriviaCard = () => {

    const [triviaData, setTriviaData] = useState(null);
    const [shuffledAnswers, setShuffledAnswers] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [points, setPoints] = useState(0);

    const fetchQuestion = () => {
        setLoading(true);
        setSelectedAnswer(null);
        axios.get('api/trivia/question')
            .then((response) => {
                const data = response.data;
                setTriviaData(data);

                const allAnswers = [data.rightAnswer, ...data.wrongAnswers];
                const shuffled = allAnswers.sort(() => Math.random() - 0.5);
                setShuffledAnswers(shuffled);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching trivia:", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchQuestion();
    }, []);

    const handleAnswerClick = (answer) => {
        setSelectedAnswer(answer);
        if (answer === triviaData.rightAnswer) {
            setPoints(prevPoints => prevPoints + 1);
        } else {
            setPoints(0);
        }
        setTimeout(() => {
            fetchQuestion();
        }, 1000);
    };

    const getButtonColor = (answer) => {
        if (!selectedAnswer) return "gray";

        if (answer === triviaData.rightAnswer) {
            return "green";
        }

        if (answer === selectedAnswer && answer !== triviaData.rightAnswer) {
            return "red";
        }

        return "gray";
    };

    return (
        <Card bg="white" className="action-card" p="xl">
            <Flex justify="space-between" align="center">
                <Title size="h3" c="red.6" mb="sm">
                    Trivia Game
                </Title>

                <Flex align="center">
                <ThemeIcon variant="white" radius="lg" size="xl" color="red.6">
                    <IconFlame style={{width: '70%', height: '70%'}}/>
                </ThemeIcon>
                    <Text c="red.6" size="xl">{points}</Text>
                </Flex>
            </Flex>

            <Text c="gray.7" bdrs="10" mb="lg">
                Answer the question below to test your knowledge of Formula One.
            </Text>

            {loading ? (
                <Center h={200}>
                    <Loader color="red"/>
                </Center>
            ) : (
                <>
                    <Box bg="red.6" bdrs="10" p="lg" mb="lg" ta="center">
                        <Text c="white" size="lg">
                            {triviaData?.question}
                        </Text>
                    </Box>

                    <SimpleGrid cols={2} spacing="sm">
                        {shuffledAnswers.map((answer, index) => (
                            <Button
                                key={index}
                                color={getButtonColor(answer)}
                                variant="outline"
                                h={60}
                                radius="md"
                                onClick={() => handleAnswerClick(answer)}
                                style={{whiteSpace: 'normal', lineHeight: 1.2}}
                            >
                                {answer}
                            </Button>
                        ))}
                    </SimpleGrid>
                </>
            )}
        </Card>
    );
};

export default TriviaCard;
