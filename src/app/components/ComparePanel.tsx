"use client";

import React, { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { BenchmarkSummary, Device, ModelJob, QuantLevel } from "../types";

interface Props {
    summaries: BenchmarkSummary[];
    devices: Device[];
    jobs: ModelJob[];
}

const QUANT_COLORS: Record<QuantLevel, string> = {
    FP32: "#3B82F6",
    FP16: "#8B5CF6",
    INT8: "#10B981",
};

const METRIC_OPTIONS = [
    { id: "avgLatencyMs", label: "Avg Latency (ms)" },
    { id: "peakRamMb", label: "Peak RAM (MB)" },
    { id: "avgCpuPct", label: "Avg CPU (%)" },
    { id: "top1Accuracy", label: "Top-1 Accuracy (%)" },
] as const;

type MetricKey = typeof METRIC_OPTIONS[number]["id"];

export default function ComparePanel({ summaries, devices, jobs }: Props) {
    const [selectedModel, setSelectedModel] = useState<string>("all");
    const [selectedDevice, setSelectedDevice] = useState<string>("all");
    const [metricKey, setMetricKey] = useState<MetricKey>("avgLatencyMs");

    const filtered = summaries.filter((s) => {
        if (selectedModel !== "all" && s.modelId !== selectedModel) return false;
        if (selectedDevice !== "all" && s.deviceId !== selectedDevice) return false;
        return true;
    });

    const metric = METRIC_OPTIONS.find((m) => m.id === metricKey)!;

    // Group by modelName+deviceName for bar chart
    type Row = { name: string; FP32?: number; FP16?: number; INT8?: number };
    const barMap = new Map<string, Row>();
    for (const s of filtered) {
        const name = `${s.modelName.split(" ").slice(0, 2).join(" ")}\n${s.deviceName.split(" ").slice(0, 2).join(" ")}`;
        if (!barMap.has(name)) barMap.set(name, { name });
        const row = barMap.get(name)!;
        row[s.quantLevel] = s[metricKey];
    }
    const barData = [...barMap.values()];

    // Radar data: normalise each metric [0..100] across FP32/FP16/INT8 for a single model
    const radarData = ["Latency", "RAM", "CPU", "Accuracy", "Efficiency"].map((label, i) => {
        const entry: Record<string, unknown> = { metric: label };
        (["FP32", "FP16", "INT8"] as QuantLevel[]).forEach((ql) => {
            const recs = filtered.filter((s) => s.quantLevel === ql);
            const vals = recs.map((s) => {
                if (i === 0) return 100 - Math.min(100, (s.avgLatencyMs / 100) * 100);
                if (i === 1) return 100 - Math.min(100, (s.peakRamMb / 1000) * 100);
                if (i === 2) return 100 - Math.min(100, s.avgCpuPct);
                if (i === 3) return s.top1Accuracy;
                return 100 - Math.abs(s.accuracyDelta) * 5;
            });
            entry[ql] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        });
        return entry;
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Filter row */}
            <div
                className="animate-fade-in"
                style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}
            >
                <SelectBox
                    id="compare-model-select"
                    value={selectedModel}
                    onChange={setSelectedModel}
                >
                    <option value="all">All Models</option>
                    {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                </SelectBox>

                <SelectBox
                    id="compare-device-select"
                    value={selectedDevice}
                    onChange={setSelectedDevice}
                >
                    <option value="all">All Devices</option>
                    {devices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </SelectBox>

                <SelectBox
                    id="compare-metric-select"
                    value={metricKey}
                    onChange={(v) => setMetricKey(v as MetricKey)}
                >
                    {METRIC_OPTIONS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </SelectBox>
            </div>

            {/* Bar Chart */}
            <div
                className="animate-fade-in"
                style={{
                    background: "var(--surface-container-lowest)",
                    borderRadius: 16,
                    padding: "22px 24px",
                    boxShadow: "var(--shadow-ambient)",
                    animationDelay: "60ms",
                }}
            >
                <h3 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 15, margin: "0 0 18px" }}>
                    {metric.label} — by Model & Device
                </h3>
                {barData.length === 0 ? (
                    <EmptyState />
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData} margin={{ top: 4, right: 20, left: 0, bottom: 20 }} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(193,200,194,0.3)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontFamily: "Inter,sans-serif", fontSize: 11, fill: "var(--on-surface-variant)" }}
                            />
                            <YAxis
                                tick={{ fontFamily: "Inter,sans-serif", fontSize: 11, fill: "var(--on-surface-variant)" }}
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
                                formatter={(v: unknown) => [`${typeof v === 'number' ? v.toFixed(2) : v}`, '']}
                            />
                            <Legend wrapperStyle={{ fontFamily: "Inter,sans-serif", fontSize: 12 }} />
                            {(["FP32", "FP16", "INT8"] as QuantLevel[]).map((ql) => (
                                <Bar key={ql} dataKey={ql} fill={QUANT_COLORS[ql]} radius={[4, 4, 0, 0]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Radar Chart */}
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
                    <h3 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 15, margin: "0 0 18px" }}>
                        Efficiency Radar
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                            <PolarGrid stroke="rgba(193,200,194,0.4)" />
                            <PolarAngleAxis
                                dataKey="metric"
                                tick={{ fontFamily: "Inter,sans-serif", fontSize: 11, fill: "var(--on-surface-variant)" }}
                            />
                            <PolarRadiusAxis
                                angle={90}
                                domain={[0, 100]}
                                tick={{ fontFamily: "Inter,sans-serif", fontSize: 9, fill: "var(--on-surface-variant)" }}
                            />
                            {(["FP32", "FP16", "INT8"] as QuantLevel[]).map((ql) => (
                                <Radar
                                    key={ql}
                                    name={ql}
                                    dataKey={ql}
                                    stroke={QUANT_COLORS[ql]}
                                    fill={QUANT_COLORS[ql]}
                                    fillOpacity={0.1}
                                    strokeWidth={2}
                                />
                            ))}
                            <Legend wrapperStyle={{ fontFamily: "Inter,sans-serif", fontSize: 12 }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary Table */}
                <div
                    className="animate-fade-in"
                    style={{
                        background: "var(--surface-container-lowest)",
                        borderRadius: 16,
                        padding: "22px 24px",
                        boxShadow: "var(--shadow-ambient)",
                        animationDelay: "140ms",
                        overflowX: "auto",
                    }}
                >
                    <h3 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 15, margin: "0 0 14px" }}>
                        Detailed Comparison
                    </h3>
                    {filtered.length === 0 ? <EmptyState /> : (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead>
                                <tr>
                                    {["Model", "Device", "Quant", "Lat. ms", "RAM MB", "CPU %", "Acc. %", "Δ Acc"].map((h) => (
                                        <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontFamily: "Inter,sans-serif", fontWeight: 600, color: "var(--on-surface-variant)", borderBottom: "2px solid var(--surface-container)" }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid var(--surface-container-low)" }}>
                                        <td style={{ padding: "7px 8px", fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "var(--on-surface)", whiteSpace: "nowrap", overflow: "hidden", maxWidth: 100, textOverflow: "ellipsis" }}>{s.modelName}</td>
                                        <td style={{ padding: "7px 8px", fontFamily: "Inter,sans-serif", color: "var(--on-surface-variant)", whiteSpace: "nowrap", overflow: "hidden", maxWidth: 100, textOverflow: "ellipsis" }}>{s.deviceName}</td>
                                        <td style={{ padding: "7px 8px" }}>
                                            <span className="chip" style={{ background: QUANT_COLORS[s.quantLevel] + "18", color: QUANT_COLORS[s.quantLevel], fontSize: 11 }}>
                                                {s.quantLevel}
                                            </span>
                                        </td>
                                        <td style={{ padding: "7px 8px", fontFamily: "Manrope,sans-serif", fontWeight: 700, color: "var(--on-surface)" }}>{s.avgLatencyMs.toFixed(1)}</td>
                                        <td style={{ padding: "7px 8px", fontFamily: "Inter,sans-serif", color: "var(--on-surface-variant)" }}>{s.peakRamMb.toFixed(0)}</td>
                                        <td style={{ padding: "7px 8px", fontFamily: "Inter,sans-serif", color: "var(--on-surface-variant)" }}>{s.avgCpuPct.toFixed(0)}</td>
                                        <td style={{ padding: "7px 8px", fontFamily: "Inter,sans-serif", color: "var(--on-surface)" }}>{s.top1Accuracy.toFixed(1)}</td>
                                        <td style={{ padding: "7px 8px" }}>
                                            <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: s.accuracyDelta >= 0 ? "var(--success)" : "var(--warning)" }}>
                                                {s.accuracyDelta >= 0 ? "+" : ""}{s.accuracyDelta.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

function SelectBox({ id, value, onChange, children }: {
    id: string;
    value: string;
    onChange: (v: string) => void;
    children: React.ReactNode;
}) {
    return (
        <div style={{ position: "relative" }}>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    appearance: "none",
                    padding: "9px 36px 9px 14px",
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
                {children}
            </select>
            <ChevronDown size={13} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--on-surface-variant)", pointerEvents: "none" }} />
        </div>
    );
}

function EmptyState() {
    return (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--on-surface-variant)", fontFamily: "Inter,sans-serif", fontSize: 14 }}>
            No data for current filter selection.
        </div>
    );
}
