import { MantineProvider } from "@mantine/core";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "@mantine/core/styles.css";

import HomePage from "./pages/HomePage";
import InfoPage from "./pages/InfoPage";
import { theme } from "./theme/theme";

const App = () => {
  return (
    <MantineProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/driver/:driverId"
            element={<InfoPage type="driver" />}
          />
          <Route
            path="/race-wins/:year"
            element={<InfoPage type="season-winners" />}
          />
          <Route
            path="/fastest-lap/race/:raceId"
            element={<InfoPage type="fastest-lap-by-race" />}
          />
          <Route
            path="/fastest-lap/circuit/:circuitId"
            element={<InfoPage type="fastest-lap-by-circuit" />}
          />
          <Route
            path="/teammate-graph/:year"
            element={<InfoPage type="teammate-graph" />}
          />
          <Route
            path="/circuits"
            element={<InfoPage type="closest-circuits" />}
          />
        </Routes>
      </Router>
    </MantineProvider>
  );
};

export default App;
