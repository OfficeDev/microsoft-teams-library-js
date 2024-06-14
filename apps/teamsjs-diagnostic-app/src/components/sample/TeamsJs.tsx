import React from "react";
import "./TeamsJs.css";
//import { Image } from "@fluentui/react-components";

export function TeamsJs(props: { docsUrl?: string }) {
  const { docsUrl } = {
    docsUrl: "https://aka.ms/teamsfx-docs",
    ...props,
  };
  return (
    <div className="teamsjs log">
      <h2>TeamsJS Logging</h2>
      <p>
        Check back later!
      </p>
      <div className="gray-box">
        <button className="gray-box-button">Generate Logs</button>
      </div>
    </div>
  );
}
