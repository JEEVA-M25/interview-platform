import { useState } from "react";
import InterviewSetup from "./InterviewSetup.jsx";
import InterviewSession from "./InterviewSession.jsx";
import InterviewReport from "./InterviewReport.jsx";

function Interview({ token, onBack }) {
  const [phase, setPhase] = useState("setup");
  const [session, setSession] = useState(null);
  const [report, setReport] = useState(null);

  function handleSessionCreated(sessionData) {
    setSession(sessionData);
    setPhase("session");
  }

  function handleFinished(reportData) {
    setReport(reportData);
    setPhase("report");
  }

  function handleNewInterview() {
    setSession(null);
    setReport(null);
    setPhase("setup");
  }

  if (phase === "session" && session) {
    return (
      <InterviewSession
        session={session}
        token={token}
        onFinished={handleFinished}
      />
    );
  }

  if (phase === "report" && report) {
    return (
      <InterviewReport
        report={report}
        sessionId={session?.sessionId}
        token={token}
        onNewInterview={handleNewInterview}
        onBack={onBack}
      />
    );
  }

  return (
    <InterviewSetup
      token={token}
      onSessionCreated={handleSessionCreated}
      onBack={onBack}
    />
  );
}

export default Interview;
