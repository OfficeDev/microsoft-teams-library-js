import "./WebHost.css";

export function WebHost(props: { docsUrl?: string }) {
  return (
    <div className="web host sdk logging">
      <h2>Web Host SDK Logging</h2>
      <p>
        Check back later!
      </p>
      <div className="gray-box">
        <button className="gray-box-button">Generate Logs</button>
      </div>
    </div>
  );
}
