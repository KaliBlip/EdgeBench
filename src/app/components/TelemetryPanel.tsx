"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine,
} from "recharts";
import { Activity, Cpu, HardDrive, Timer, ChevronDown, Wifi } from "lucide-react";
import { ModelJob, Device, TelemetryRecord, QuantLevel } from "../types";

interface Props {
    jobs: ModelJob[];
    devices: Device[];
    telemetry: TelemetryRecord[];
    selectedJobId: string;
    onJobChange: (id: string) => void;
}

const QUANT_COLORS: Record<QuantLevel, string> = {
    FP32: "#3B82F6",
    FP16: "#8B5CF6",
    INT8: "#10B981",
};

const CHART_TABS = [
    { id: "latency", label: "Latency (ms)", field: "latencyMsMean" as const, color: "#3B82F6", unit: "ms" },
    { id: "ram", label: "RAM Peak (MB)", field: "ramMbPeak" as const, color: "#8B5CF6", unit: "MB" },
    { id: "cpu", label: "CPU Avg (%)", field: "cpuPctAvg" as const, color: "#10B981", unit: "%" },
];

function StatBadge({ label, value, unit, color }: { label: string; value: string | number; unit?: string; color: string }) {
    return (
        <div
            style={{
                background: "var(--surface-container-lowest)",
                borderRadius: 12,
                padding: "14px 18px",
                boxShadow: "var(--shadow-ambient)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
            }}
        >
            <span style={{ fontSize: 11, color: "var(--on-surface-variant)", fontFamily: "Inter,sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {label}
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 24, color }}>
                    {typeof value === "number" ? value.toFixed(1) : value}
                </span>
                {unit && (
                    <span style={{ fontSize: 12, color: "var(--on-surface-variant)", fontFamily: "Inter,sans-serif" }}>
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function TelemetryPanel({ jobs, devices, telemetry, selectedJobId, onJobChange }: Props) {
    const [activeTab, setActiveTab] = useState("latency");
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>("all");
    const [liveRun, setLiveRun] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const job = jobs.find((j) => j.id === selectedJobId);

    // Filter telemetry for selected job
    const jobTelemetry = telemetry.filter((r) => r.modelId === selectedJobId);
    const deviceIds = [...new Set(jobTelemetry.map((r) => r.deviceId))];
    const quantLevels = [...new Set(jobTelemetry.map((r) => r.quantLevel))] as QuantLevel[];

    // Accumulate live runs
    useEffect(() => {
        setLiveRun(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
        const maxRun = Math.max(0, ...jobTelemetry.map((r) => r.runIndex));
        if (maxRun === 0) return;
        intervalRef.current = setInterval(() => {
            setLiveRun((prev) => {
                if (prev >= maxRun) {
                    clearInterval(intervalRef.current!);
                    return maxRun;
                }
                return prev + 1;
            });
        }, 40);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [selectedJobId]);

    // Build chart data: one data point per run index
    const filteredTelemetry = selectedDeviceId === "all"
        ? jobTelemetry
        : jobTelemetry.filter((r) => r.deviceId === selectedDeviceId);

    const maxRun = Math.max(0, ...filteredTelemetry.map((r) => r.runIndex));
    const displayedRun = Math.min(liveRun, maxRun);

    const chartData: Record<string, unknown>[] = [];
    for (let i = 1; i <= displayedRun; i++) {
        const point: Record<string, unknown> = { run: i };
        for (const ql of quantLevels) {
            const rec = filteredTelemetry.find((r) => r.runIndex === i && r.quantLevel === ql);
            if (rec) {
                const tab = CHART_TABS.find((t) => t.id === activeTab)!;
                point[ql] = (rec as Record<string, unknown>)[tab.field];
            }
        }
        chartData.push(point);
    }

    // Summary stats from displayed data
    const tab = CHART_TABS.find((t) => t.id === activeTab)!;
    const mainQuant = quantLevels[0] ?? "FP32";
    const mainRecs = filteredTelemetry.filter((r) => r.quantLevel === mainQuant && r.runIndex <= displayedRun);
    const avgLatency = mainRecs.length ? mainRecs.reduce((s, r) => s + r.latencyMsMean, 0) / mainRecs.length : 0;
    const peakRam = mainRecs.length ? Math.max(...mainRecs.map((r) => r.ramMbPeak)) : 0;
    const avgCpu = mainRecs.length ? mainRecs.reduce((s, r) => s + r.cpuPctAvg, 0) / mainRecs.length : 0;
    const accuracy = mainRecs[0]?.top1Accuracy ?? 0;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Selectors Row */}
            <div
                className="animate-fade-in"
                style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    flexWrap: "wrap",
                }}
            >
                {/* Job selector */}
                <div style={{ position: "relative" }}>
                    <select
                        id="telemetry-job-select"
                        value={selectedJobId}
                        onChange={(e) => onJobChange(e.target.value)}
                        style={{
                            appearance: "none",
                            padding: "10px 36px 10px 14px",
                            borderRadius: 10,
                            border: "none",
                            background: "var(--surface-container-lowest)",
                            boxShadow: "var(--shadow-ambient)",
                            fontFamily: "Manrope,sans-serif",
                            fontWeight: 700,
                            fontSize: 14,
                            color: "var(--on-surface)",
                            cursor: "pointer",
                            outline: "none",
                        }}
                    >
                        {jobs.map((j) => (
                            <option key={j.id} value={j.id}>
                                {j.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--on-surface-variant)", pointerEvents: "none" }} />
                </div>

                {/* Device selector */}
                <div style={{ position: "relative" }}>
                    <select
                        id="telemetry-device-select"
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        style={{
                            appearance: "none",
                            padding: "10px 36px 10px 14px",
                            borderRadius: 10,
                            border: "none",
                            background: "var(--surface-container-lowest)",
                            boxShadow: "var(--shadow-ambient)",
                            fontFamily: "Inter,sans-serif",
                            fontSize: 13,
                            color: "var(--on-surface)",
                            cursor: "pointer",
                            outline: "none",
                        }}
                    >
                        <option value="all">All Devices</option>
                        {deviceIds.map((id) => {
                            const dev = devices.find((d) => d.id === id);
                            return <option key={id} value={id}>{dev?.name ?? id}</option>;
                        })}
                    </select>
                    <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--on-surface-variant)", pointerEvents: "none" }} />
                </div>

                <div style={{ flex: 1 }} />

                {/* Live indicator */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "rgba(16,185,129,0.10)",
                        borderRadius: 9999,
                        padding: "7px 14px",
                    }}
                >
                    <div
                        style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "var(--accent-green)",
                            animation: liveRun < maxRun ? "pulse-glow 1.5s ease infinite" : "none",
                        }}
                    />
                    <Wifi size={13} style={{ color: "var(--accent-green)" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-green)", fontFamily: "Inter,sans-serif" }}>
                        {liveRun < maxRun ? `Streaming run ${liveRun} / ${maxRun}` : `${maxRun} runs complete`}
                    </span>
                </div>
            </div>

            {/* Stats row */}
            <div
                className="animate-fade-in"
                style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, animationDelay: "60ms" }}
            >
                <StatBadge label="Avg Latency" value={avgLatency} unit="ms" color="var(--accent-blue)" />
                <StatBadge label="Peak RAM" value={peakRam} unit="MB" color="var(--accent-purple)" />
                <StatBadge label="Avg CPU" value={avgCpu} unit="%" color="var(--accent-green)" />
                <StatBadge label="Top-1 Acc." value={accuracy} unit="%" color="var(--primary)" />
            </div>

            {/* Chart Card */}
            <div
                className="animate-fade-in"
                style={{
                    background: "var(--surface-container-lowest)",
                    borderRadius: 16,
                    padding: "22px 24px",
                    boxShadow: "var(--shadow-ambient)",
                    animationDelay: "100ms",
                }}
            >
                {/* Chart Tab switcher */}
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
                    {CHART_TABS.map((t) => (
                        <button
                            key={t.id}
                            id={`chart-tab-${t.id}`}
                            onClick={() => setActiveTab(t.id)}
                            style={{
                                padding: "7px 16px",
                                borderRadius: 9999,
                                border: "none",
                                background: activeTab === t.id ? "var(--primary)" : "var(--surface-container-low)",
                                color: activeTab === t.id ? "white" : "var(--on-surface-variant)",
                                fontFamily: "Inter,sans-serif",
                                fontWeight: activeTab === t.id ? 600 : 400,
                                fontSize: 13,
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 12, color: "var(--on-surface-variant)", fontFamily: "Inter,sans-serif" }}>
                        {job?.name ?? "—"} · {selectedDeviceId === "all" ? "All devices" : devices.find((d) => d.id === selectedDeviceId)?.name}
                    </span>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(193,200,194,0.3)" vertical={false} />
                        <XAxis
                            dataKey="run"
                            tick={{ fontFamily: "Inter,sans-serif", fontSize: 11, fill: "var(--on-surface-variant)" }}
                            label={{ value: "Inference Run", position: "insideBottomRight", offset: -10, fontSize: 11, fill: "var(--on-surface-variant)" }}
                        />
                        <YAxis
                            tick={{ fontFamily: "Inter,sans-serif", fontSize: 11, fill: "var(--on-surface-variant)" }}
                            unit={tab.unit}
                            width={55}
                        />
                        <Tooltip
                            contentStyle={{
                                background: "rgba(255,255,255,0.92)",
                                backdropFilter: "blur(12px)",
                                borderRadius: 12,
                                border: "none",
                                boxShadow: "0 8px 24px rgba(25,28,29,0.1)",
                                fontFamily: "Inter,sans-serif",
                                fontSize: 12,
                            }}
                            formatter={(v: unknown, name: string) => [`${typeof v === 'number' ? v.toFixed(2) : v} ${tab.unit}`, name]}
                        />
                        <Legend
                            wrapperStyle={{ fontFamily: "Inter,sans-serif", fontSize: 12 }}
                        />
                        {quantLevels.map((ql) => (
                            <Line
                                key={ql}
                                type="monotone"
                                dataKey={ql}
                                stroke={QUANT_COLORS[ql]}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                                isAnimationActive={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Accuracy Table */}
            {quantLevels.length > 0 && (
                <div
                    className="animate-fade-in"
                    style={{
                        background: "var(--surface-container-lowest)",
                        borderRadius: 16,
                        padding: "20px 24px",
                        boxShadow: "var(--shadow-ambient)",
                        animationDelay: "160ms",
                    }}
                >
                    <h3 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 15, margin: "0 0 14px" }}>
                        Quantization Trade-off Summary
                    </h3>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                {["Quant", "Avg Latency", "P95 Latency", "Peak RAM", "Avg CPU", "Top-1 Acc.", "Δ vs FP32"].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: "8px 12px",
                                            textAlign: "left",
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: "var(--on-surface-variant)",
                                            fontFamily: "Inter,sans-serif",
                                            borderBottom: "2px solid var(--surface-container)",
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {quantLevels.map((ql) => {
                                const recs = filteredTelemetry.filter((r) => r.quantLevel === ql && r.runIndex <= displayedRun);
                                if (!recs.length) return null;
                                const avgLat = recs.reduce((s, r) => s + r.latencyMsMean, 0) / recs.length;
                                const p95Lat = recs.reduce((s, r) => s + r.latencyMsP95, 0) / recs.length;
                                const pkRam = Math.max(...recs.map((r) => r.ramMbPeak));
                                const avgCpu2 = recs.reduce((s, r) => s + r.cpuPctAvg, 0) / recs.length;
                                const acc = recs[0].top1Accuracy;
                                const delta = recs[0].accuracyDeltaVsFp32;
                                return (
                                    <tr
                                        key={ql}
                                        style={{ borderBottom: "1px solid var(--surface-container-low)" }}
                                    >
                                        <td style={{ padding: "10px 12px" }}>
                                            <span
                                                className="chip"
                                                style={{
                                                    background: QUANT_COLORS[ql] + "18",
                                                    color: QUANT_COLORS[ql],
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {ql}
                                            </span>
                                        </td>
                                        <td style={{ padding: "10px 12px", fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 14, color: "var(--on-surface)" }}>
                                            {avgLat.toFixed(1)} ms
                                        </td>
                                        <td style={{ padding: "10px 12px", fontFamily: "Inter,sans-serif", fontSize: 13, color: "var(--on-surface-variant)" }}>
                                            {p95Lat.toFixed(1)} ms
                                        </td>
                                        <td style={{ padding: "10px 12px", fontFamily: "Inter,sans-serif", fontSize: 13, color: "var(--on-surface-variant)" }}>
                                            {pkRam.toFixed(0)} MB
                                        </td>
                                        <td style={{ padding: "10px 12px", fontFamily: "Inter,sans-serif", fontSize: 13, color: "var(--on-surface-variant)" }}>
                                            {avgCpu2.toFixed(0)}%
                                        </td>
                                        <td style={{ padding: "10px 12px", fontFamily: "Manrope,sans-serif", fontWeight: 600, fontSize: 14, color: "var(--on-surface)" }}>
                                            {acc.toFixed(1)}%
                                        </td>
                                        <td style={{ padding: "10px 12px" }}>
                                            <span
                                                style={{
                                                    fontFamily: "Manrope,sans-serif",
                                                    fontWeight: 700,
                                                    fontSize: 13,
                                                    color: delta >= 0 ? "var(--success)" : "var(--warning)",
                                                }}
                                            >
                                                {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
