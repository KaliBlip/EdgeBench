"use client";

import React, { useState, useCallback, useRef } from "react";
import { MOCK_JOBS, MOCK_DEVICES, MOCK_TELEMETRY, buildSummaries } from "./mockData";
import { ModelJob, QuantLevel } from "./types";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import OverviewPanel from "./components/OverviewPanel";
import UploadPanel from "./components/UploadPanel";
import TelemetryPanel from "./components/TelemetryPanel";
import ComparePanel from "./components/ComparePanel";
import DevicesPanel from "./components/DevicesPanel";

export type ActiveView = "overview" | "upload" | "telemetry" | "compare" | "devices";

export default function EdgeBenchDashboard() {
  const [activeView, setActiveView] = useState<ActiveView>("overview");
  const [jobs, setJobs] = useState<ModelJob[]>(MOCK_JOBS);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string>("job-001");

  const summaries = buildSummaries(jobs, MOCK_DEVICES, MOCK_TELEMETRY);

  const handleJobSelect = useCallback((id: string) => {
    setSelectedJobId(id);
    setActiveView("telemetry");
  }, []);

  const handleUploadComplete = useCallback((job: ModelJob) => {
    setJobs((prev) => [job, ...prev]);
    setSelectedJobId(job.id);
    setActiveView("telemetry");
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--surface)",
      }}
    >
      <Sidebar
        open={sidebarOpen}
        activeView={activeView}
        onNavigate={setActiveView}
        jobs={jobs}
        onJobSelect={handleJobSelect}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Header
          activeView={activeView}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          connectedDevices={MOCK_DEVICES.filter((d) => d.connected).length}
        />

        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px 32px",
          }}
        >
          {activeView === "overview" && (
            <OverviewPanel
              jobs={jobs}
              devices={MOCK_DEVICES}
              summaries={summaries}
              onJobSelect={handleJobSelect}
              onNavigate={setActiveView}
            />
          )}
          {activeView === "upload" && (
            <UploadPanel onUploadComplete={handleUploadComplete} />
          )}
          {activeView === "telemetry" && (
            <TelemetryPanel
              jobs={jobs}
              devices={MOCK_DEVICES}
              telemetry={MOCK_TELEMETRY}
              selectedJobId={selectedJobId}
              onJobChange={setSelectedJobId}
            />
          )}
          {activeView === "compare" && (
            <ComparePanel summaries={summaries} devices={MOCK_DEVICES} jobs={jobs} />
          )}
          {activeView === "devices" && (
            <DevicesPanel devices={MOCK_DEVICES} />
          )}
        </main>
      </div>
    </div>
  );
}
