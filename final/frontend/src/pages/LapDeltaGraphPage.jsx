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
import { useParams } from "react-router-dom";
import api from "../api";

// TODO: switch to using constructor colours
const colors = [
  "#e03131", "#1971c2", "#2f9e44", "#ae3ec9", "#fd7e14",
  "#0ca678", "#1c7ed6", "#d6336c", "#5c940d", "#7048e8"
];

const LapDeltaPage = () => {
  const { raceId } = useParams(); 
  const [data, setData] = useState([]);        // graph data
  const [drivers, setDrivers] = useState([]);  // names for legend
  const [selectedInfo, setSelectedInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/lap-delta-all/${raceId}`);
        const drivers = res.data.drivers;

        setDrivers(drivers);  

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
            width={1000}
            height={550}
            data={data}
            onClick={handleClickPoint}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="lap" label={{ value: "Lap", offset: -5, position: "insideBottom" }} />
            <YAxis label={{ value: "Δ Lap (ms)", angle: -90, dx: -10, position: "insideLeft" }} />
            <Tooltip />
            <Legend />

            {drivers.map((d, idx) => (
              <Line
                key={d.name}
                type="monotone"
                dataKey={d.name}
                stroke={colors[idx % colors.length]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
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
          {`Race ${raceId} — Lap Deltas`}
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
          {selectedInfo
            ? selectedInfo
            : "Click a driver's line or a point on the chart to see more details."}
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
            You can toggle lines by clicking the legend above the chart.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LapDeltaPage;
