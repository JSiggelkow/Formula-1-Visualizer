import { Autocomplete, Box, Button, Group, Switch, Text, Loader } from "@mantine/core";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api";
import "./DriverSearchBar.css";

const DriverOption = ({option}) => {
    return (
        <Group justify="space-between" w="100%">
            <Text fw={600} c="dark">
                {option.driver?.forename} {option.driver?.surname}
            </Text>
            <Text size="sm" c="dimmed">
                {option.driver?.nationality}
            </Text>
        </Group>
    );
};

const DriverSearchBar = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [autocompleteData, setAutocompleteData] = useState([]);
    const [useAdvancedSearch, setUseAdvancedSearch] = useState(false);
    const [lastSearchedTerm, setLastSearchedTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const pollIntervalRef = useRef(null);
    const searchTermRef = useRef("");
    const lastSearchedTermRef = useRef("");

    useEffect(() => {
        searchTermRef.current = searchTerm;
    }, [searchTerm]);

    useEffect(() => {
        lastSearchedTermRef.current = lastSearchedTerm;
    }, [lastSearchedTerm]);

    // Handle immediate clearing when search becomes empty (don't wait for poll)
    useEffect(() => {
        if (searchTerm.length === 0) {
            setAutocompleteData([]);
            setLastSearchedTerm("");
            setIsLoading(false);
        }
    }, [searchTerm]);

    // Setup polling to check for search term changes to avoid excessive API calls
    useEffect(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
        }
        
        // Trigger immediate search when switching search modes if there's a current search term
        if (searchTerm.length > 0) {
            setIsLoading(true);
            fetchDriverSuggestions(searchTerm);
            setLastSearchedTerm(searchTerm);
        }

        const pollInterval = useAdvancedSearch ? 1000 : 100;   
        pollIntervalRef.current = setInterval(() => {
            const currentTerm = searchTermRef.current;
            const lastTerm = lastSearchedTermRef.current;
            
            if (currentTerm !== lastTerm && currentTerm.length > 0) {
                setIsLoading(true);
                fetchDriverSuggestions(currentTerm);
                setLastSearchedTerm(currentTerm);
            }
        }, pollInterval);
        
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [useAdvancedSearch]);

    const fetchDriverSuggestions = async (term) => {
        try {
            const terms = term.trim().split(/\s+/)

            let apiCalls;

            if (useAdvancedSearch) {
                const endpoint = '/driver-v2';
                apiCalls = [api.get(`${endpoint}?search_str=${term}`)];
            } else {
                const endpoint = '/driver';
                if (terms.length >= 2) {
                    const forename = terms.slice(0, terms.length - 1).join(' ');
                    const surname = terms[terms.length - 1];

                    apiCalls = [
                        api.get(`${endpoint}?forename=${forename}&surname=${surname}`),
                        api.get(`${endpoint}?forename=${term}`),
                        api.get(`${endpoint}?surname=${term}`),
                    ];
                } else {
                    apiCalls = [
                        api.get(`${endpoint}?forename=${term}`),
                        api.get(`${endpoint}?surname=${term}`),
                    ];
                }
            }

            const responses = await Promise.all(apiCalls);

            const combined = responses.flatMap(res => res.data);
            const unique = combined.filter(
                (driver, index, self) => index === self.findIndex(d => d.driverId === driver.driverId))

            const data = unique.map((driver) => ({
                value: `${driver.forename} ${driver.surname}`,
                label: `${driver.forename} ${driver.surname}`,
                driver: driver,
            }));
            console.log("Got data:", data);
            setAutocompleteData(data);
        } catch (error) {
            console.error("Error fetching driver suggestions:", error);
            setAutocompleteData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDriverSelect = (value) => {
        const option = autocompleteData.find((opt) => opt.value === value);
        if (option && option.driver) {
            navigate(`/driver/${option.driver.driverId}`);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (autocompleteData.length > 0) {
            handleDriverSelect(autocompleteData[0].value);
        }
    };

    return (
        <Box w="60%">
            <Group gap={0} className="search-bar-container">
                <Autocomplete
                    value={searchTerm}
                    onChange={setSearchTerm}
                    onOptionSubmit={handleDriverSelect}
                    data={autocompleteData}
                    placeholder={
                        useAdvancedSearch ?
                            "Search for a driver by characteristic (e.g. \"Formula Two\")" :
                            "Search for a driver by name (e.g. \"Max Verstappen\")"
                    }
                    size="lg"
                    className="autocomplete"
                    classNames={{
                        input: "search-input",
                    }}
                    renderOption={({option}) => <DriverOption option={option}/>}
                    filter={() => {
                        return autocompleteData;
                    }}
                    rightSection={isLoading ? <Loader size="sm" color="red.5" /> : null}
                />
                <Button
                    type="submit"
                    size="lg"
                    color="red.5"
                    className="submit-button"
                    onClick={handleSubmit}
                >
                    Search
                </Button>
            </Group>
            <Switch
                label="Use advanced search mode"
                checked={useAdvancedSearch}
                onChange={(event) => setUseAdvancedSearch(event.currentTarget.checked)}
                mt="md"
                color="red.6"
                c="gray.3"
                display="inline-flex"
            />
        </Box>
    );
};

export default DriverSearchBar;
