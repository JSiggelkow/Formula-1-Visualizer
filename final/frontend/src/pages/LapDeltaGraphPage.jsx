import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

import { useEffect, useState } from "react";
import api from "../api";

const LapDeltaPage = ({ raceId }) => {
  const [data, setData] = useState([]);        // graph data
  const [drivers, setDrivers] = useState([]);  // names for legend
  const [raceName, setRaceName] = useState([]);
  const [hiddenLines, setHiddenLines] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/lap-delta-all/${raceId}`);
        const drivers = res.data.drivers;

        setDrivers(drivers);
        setRaceName(res.data.race_name);

        const hiddenInit = {};
        drivers.forEach((d, idx) => {
          hiddenInit[d.name] = idx !== 0;   // hide everything except index 0
        });
        setHiddenLines(hiddenInit);

        const chartRows = [];
        const maxLaps = Math.max(...drivers.map(d => d.laps.length));

        for (let i = 0; i < maxLaps; i++) {
          const row = { lap: i + 1 };
          for (const d of drivers) {
            row[d.name] = d.delta[i] ?? null;
          }
          chartRows.push(row);
        }

        setData(chartRows);

      } catch (err) {
        console.error("Error fetching lap delta data:", err);
      }
    };

    fetchData();
    console.log(raceId)
  }, [raceId]);

  const handleClickPoint = (e) => {
    if (!e || !e.activePayload) return;

    const p = e.activePayload[0];
    const driverName = p.dataKey;
    const lap = p.payload.lap;
    const delta = p.payload[driverName];

    setSelectedInfo(`Driver: ${driverName}\nLap: ${lap}\nDelta: ${delta} ms`);
  };

  const handleLegendClick = (e) => {
    const driverName = e.value;   // legend label
    setHiddenLines(prev => ({
      ...prev,
      [driverName]: !prev[driverName]
    }));
  };

  return (
    <div
      style={{
        display: "flex",
        height: "90vh",
        width: "100%",
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* CHART */}
      <div style={{ flex: "1 1 auto", padding: "20px" }}>
        {data.length > 0 && (
          <LineChart
            width='100%'
            height='90%'
            data={data}
            onClick={handleClickPoint}
            margin={{ top: 0, right: 10, bottom: 0, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="lap" tickCount={10} label={{ value: "Lap", offset: -5, position: "insideBottom" }} />
            <YAxis label={{ value: "Δ Lap (ms)", angle: -90, dx: -10, position: "insideLeft" }} />
            <Tooltip />
            <Legend onClick={handleLegendClick} />

            {drivers.map((d, idx) => (
              <Line
                key={d.name}
                type="monotone"
                dataKey={d.name}
                stroke={d.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                hide={hiddenLines[d.name]}
              />
            ))}
          </LineChart>
        )}
      </div>

      {/* INFO PANEL */}
      <div
        style={{
          width: "320px",
          background: "white",
          borderLeft: "1px solid #e0e0e0",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
          zIndex: 10
        }}
      >
        <h3 style={{ color: "#e03131", marginBottom: "12px" }}>
          {`${raceName} — Lap Deltas`}
        </h3>

        <div
          style={{
            color: "#555",
            whiteSpace: "pre-line",
            lineHeight: "1.5",
            flex: 1,
            paddingRight: "6px"
          }}
        >
        </div>

        {/* LEGEND */}
        <div
          style={{
            marginTop: "20px",
            paddingTop: "12px",
            borderTop: "1px solid #ddd"
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "8px", color: "#444" }}>
            Legend
          </div>

          <div style={{ color: "#555" }}>
            Each line represents a driver's lap-to-lap delta time.
            <br />
            You can toggle lines by clicking the names below the chart.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LapDeltaPage;
