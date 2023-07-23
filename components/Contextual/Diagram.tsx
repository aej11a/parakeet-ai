import { useEffect, useRef } from "react";
import flowchart from "flowchart.js";

export const Flowchart = ({ data }: { data: string }) => {
  const refDiv = useRef(null);

  useEffect(() => {
    if (refDiv.current && data.length > 0) {
      const diagram = flowchart.parse(data);
      diagram.drawSVG(refDiv.current, {
        x: 0,
        y: 0,
        "line-width": 3,
        "line-length": 50,
        "text-margin": 10,
        "font-size": 14,
        "font-color": "black",
        "line-color": "black",
        "element-color": "black",
        fill: "white",
        "yes-text": "yes",
        "no-text": "no",
        "arrow-end": "block",
        scale: 1,
        symbols: {
          start: {
            "font-color": "red",
            "element-color": "green",
            fill: "yellow",
          },
          end: {
            class: "end-element",
          },
        },
        flowstate: {
          past: { fill: "#CCCCCC", "font-size": 12 },
          current: {
            fill: "yellow",
            "font-color": "red",
            "font-weight": "bold",
          },
          future: { fill: "#FFFF99" },
        },
      });
    }
  }, [data]);

  return <div ref={refDiv}></div>;
};
