import React from "react";
import "./WebHub.css";
//import { Image } from "@fluentui/react-components";

export function WebHub(props: { docsUrl?: string }) {
  const { docsUrl } = {
    docsUrl: "https://aka.ms/teamsfx-docs",
    ...props,
  };
  return (
    <div className="web hub sdk logging">
      <h2>Web Hub SDK Logging</h2>
      <p>
        Check back later!
      </p>
      <div className="gray-box">
        <button className="gray-box-button">Generate Logs</button>
      </div>
    </div>
  );
}
