// src/pages/GraphPage.jsx
import CytoscapeComponent from "react-cytoscapejs";
import { useEffect, useState, useRef } from "react";
import api from "../api";

function computeNodeDiameter() {
  const length = 3;
  const fontSize = 14;
  const charWidth = fontSize * 0.6;
  const textWidth = length * charWidth;
  const textHeight = fontSize * 1.25;
  return Math.max(textWidth, textHeight) + 30;
}
const DEFAULT_NODE_DIAMETER = computeNodeDiameter();

const cyStylesheet = [
  {
    selector: "node",
    style: {
      label: "data(code)",
      color: "white",
      "text-outline-color": "black",
      "text-outline-width": 2,
      shape: "ellipse",
      width: DEFAULT_NODE_DIAMETER,
      height: DEFAULT_NODE_DIAMETER,
      "text-valign": "center",
      "text-halign": "center",
      "font-size": "14px",
      "border-width": 6,
      "border-color": "#000000",
      "background-color": "data(color)"
    }
  },
  {
    selector: 'edge[is_current = 1]',
    style: {
      "line-color": "green",
      width: 8,
      "z-index": 9999
    }
  },
  {
    selector: 'edge[is_current = 0]',
    style: {
      "line-color": "blue",
      width: 6,
      "z-index": 1
    }
  }
];

const GraphPage = ({ year }) => {
  const [elements, setElements] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (year) fetchGraphData(year);
  }, [year]);

  const fetchGraphData = async (yr) => {
    try {
      const res = await api.get(`/graph-data/${yr}`);
      setElements(res.data);
    } catch (error) {
      console.error("Error fetching graph data:", error);
    }
  };

  // Run layout and setup click handlers
  useEffect(() => {
    if (cyRef.current && elements.length > 0) {
      const cy = cyRef.current;

      cy.off("tap", "node");
      cy.off("tap", "edge");

      cy.on("tap", "node", (evt) => {
        const data = evt.target.data();
        setSelectedInfo(
          `Driver: ${data.forename} ${data.surname}\nConstructor: ${data.ctor_name || "N/A"}`
        );
      });

      cy.on("tap", "edge", (evt) => {
        const data = evt.target.data();
        setSelectedInfo(
          `Edge: ${data.source_code} ↔ ${data.target_code}\n` +
          `Constructor: ${data.constructorNames.at(-1)}\n` +
          `Years together: ${data.years?.sort((a, b) => a - b).join(", ")}\n`
        );
      });

      const layout = cy.layout({
        name: "cose",
        animate: "end",
        padding: 30,
        nodeDimensionsIncludeLabels: true,
        fit: true,
        randomize: true,
        idealEdgeLength: 120,
        nodeRepulsion: 8000,
        gravity: 0.25,
        numIter: 1000
      });

      layout.on("layoutstop", () => {
        cy.fit(cy.elements(":visible"), 30);
        const zoom = cy.zoom();
        cy.minZoom(zoom * 0.85);
        cy.maxZoom(zoom * 5);
      });

      layout.run();
      cy.autolock(true);
    }
  }, [elements]);

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
      <div style={{ flex: "1 1 auto" }}>
        <CytoscapeComponent
          elements={elements}
          style={{ width: "100%", height: "100%" }}
          stylesheet={cyStylesheet}
          cy={(cy) => { cyRef.current = cy; }}
          layout={{ name: "preset" }}
        />
      </div>

      <div
        style={{
          width: "320px",
          background: "white",
          borderLeft: "1px solid #e0e0e0",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.15)"
        }}
      >
        <h3 style={{ color: "#e03131", marginBottom: "12px" }}>
          {`${year} Driver & Teammate Info`}
        </h3>

        <div
          style={{
            color: "#555",
            whiteSpace: "pre-line",
            lineHeight: "1.5",
            flex: "1",
            paddingRight: "6px"
          }}
        >
          {selectedInfo
            ? selectedInfo
            : "Click a node or edge in the graph to see more details."}
        </div>
        {/* Legend */}
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

          <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
            <div
              style={{
                width: "20px",
                height: "4px",
                backgroundColor: "green",
                marginRight: "8px"
              }}
            />
            <span style={{ color: "#555" }}>{`Teammates in ${year}`}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "20px",
                height: "4px",
                backgroundColor: "blue",
                marginRight: "8px"
              }}
            />
            <span style={{ color: "#555" }}>Former / later teammates</span>
          </div>
        </div>

      </div>
    </div>
  );

};

export default GraphPage;
