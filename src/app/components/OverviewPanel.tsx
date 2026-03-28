"use client";

import React from "react";
import {
    CheckCircle2,
    Loader2,
    Activity,
    Smartphone,
    ArrowRight,
    TrendingDown,
    Zap,
    Database,
} from "lucide-react";
import { ModelJob, Device, BenchmarkSummary } from "../types";
import { ActiveView } from "../page";

interface Props {
    jobs: ModelJob[];
    devices: Device[];
    summaries: BenchmarkSummary[];
    onJobSelect: (id: string) => void;
    onNavigate: (v: ActiveView) => void;
}

function MetricCard({
    label,
    value,
    sub,
    icon: Icon,
    color = "var(--primary)",
    bg = "rgba(1,45,29,0.07)",
    delay = 0,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ElementType;
    color?: string;
    bg?: string;
    delay?: number;
}) {
    return (
        <div
            className="animate-fade-in"
            style={{
                background: "var(--surface-container-lowest)",
                borderRadius: 16,
                padding: "20px 22px",
                boxShadow: "var(--shadow-ambient)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                animationDelay: `${delay}ms`,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "var(--on-surface-variant)", fontFamily: "Inter,sans-serif" }}>
                    {label}
                </span>
                <div
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Icon size={16} style={{ color }} />
                </div>
            </div>
            <div>
                <div
                    style={{
                        fontFamily: "Manrope, sans-serif",
                        fontWeight: 800,
                        fontSize: 28,
                        color: "var(--on-surface)",
                        lineHeight: 1,
                    }}
                >
                    {value}
                </div>
                {sub && (
                    <div style={{ fontSize: 12, color: "var(--on-surface-variant)", marginTop: 4, fontFamily: "Inter,sans-serif" }}>
                        {sub}
                    </div>
                )}
            </div>
        </div>
    );
}

function statusLabel(s: ModelJob["status"]) {
    const map: Record<string, { label: string; color: string; bg: string }> = {
        done: { label: "Done", color: "var(--success)", bg: "rgba(27,138,87,0.12)" },
        converting: { label: "Converting", color: "var(--warning)", bg: "rgba(217,119,6,0.12)" },
        running: { label: "Running", color: "var(--accent-blue)", bg: "rgba(59,130,246,0.12)" },
        failed: { label: "Failed", color: "var(--error)", bg: "rgba(186,26,26,0.12)" },
        uploading: { label: "Uploading", color: "var(--accent-purple)", bg: "rgba(139,92,246,0.12)" },
        ready: { label: "Ready", color: "var(--info)", bg: "rgba(29,111,164,0.12)" },
    };
    return map[s] ?? { label: s, color: "var(--on-surface-variant)", bg: "var(--surface-container)" };
}

export default function OverviewPanel({ jobs, devices, summaries, onJobSelect, onNavigate }: Props) {
    const doneJobs = jobs.filter((j) => j.status === "done").length;
    const activeJobs = jobs.filter((j) => j.status === "converting" || j.status === "running").length;
    const connectedDevices = devices.filter((d) => d.connected).length;
    const totalRuns = summaries.reduce((s, b) => s + b.totalRuns, 0);

    // Best latency model
    const bestLatency = summaries.length
        ? summaries.reduce((a, b) => (a.avgLatencyMs < b.avgLatencyMs ? a : b))
        : null;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Welcome Banner */}
            <div
                className="animate-fade-in"
                style={{
                    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)",
                    borderRadius: 20,
                    padding: "28px 32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                {/* Decorative circles */}
                <div
                    style={{
                        position: "absolute",
                        right: -40,
                        top: -40,
                        width: 180,
                        height: 180,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.05)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        right: 60,
                        bottom: -60,
                        width: 140,
                        height: 140,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.04)",
                    }}
                />
                <div style={{ position: "relative", zIndex: 1 }}>
                    <h2
                        style={{
                            fontFamily: "Manrope,sans-serif",
                            fontWeight: 800,
                            fontSize: 22,
                            color: "white",
                            margin: "0 0 6px",
                        }}
                    >
                        Welcome to EdgeBench
                    </h2>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", fontFamily: "Inter,sans-serif", margin: 0 }}>
                        Upload, convert, and benchmark AI models on real edge hardware — no mobile expertise required.
                    </p>
                </div>
                <button
                    id="overview-upload-cta"
                    onClick={() => onNavigate("upload")}
                    style={{
                        background: "rgba(255,255,255,0.15)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        borderRadius: 9999,
                        padding: "10px 20px",
                        color: "white",
                        fontFamily: "Inter,sans-serif",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flexShrink: 0,
                        transition: "background 0.2s",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    Upload Model <ArrowRight size={14} />
                </button>
            </div>

            {/* Metric Cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 16,
                }}
            >
                <MetricCard
                    label="Completed Jobs"
                    value={doneJobs}
                    sub="models benchmarked"
                    icon={CheckCircle2}
                    color="var(--accent-green)"
                    bg="rgba(16,185,129,0.1)"
                    delay={0}
                />
                <MetricCard
                    label="Active Jobs"
                    value={activeJobs}
                    sub="currently processing"
                    icon={Loader2}
                    color="var(--accent-orange)"
                    bg="rgba(245,158,11,0.1)"
                    delay={60}
                />
                <MetricCard
                    label="Devices Online"
                    value={`${connectedDevices}/${devices.length}`}
                    sub="edge profiling nodes"
                    icon={Smartphone}
                    color="var(--accent-blue)"
                    bg="rgba(59,130,246,0.1)"
                    delay={120}
                />
                <MetricCard
                    label="Total Inference Runs"
                    value={totalRuns.toLocaleString()}
                    sub="across all devices"
                    icon={Activity}
                    color="var(--accent-purple)"
                    bg="rgba(139,92,246,0.1)"
                    delay={180}
                />
            </div>

            {/* Lower two-column grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Recent Jobs List */}
                <div
                    className="animate-fade-in"
                    style={{
                        background: "var(--surface-container-lowest)",
                        borderRadius: 16,
                        padding: "20px 22px",
                        boxShadow: "var(--shadow-ambient)",
                        animationDelay: "200ms",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <h3 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 15, margin: 0 }}>
                            Recent Jobs
                        </h3>
                        <button
                            id="view-all-jobs"
                            onClick={() => onNavigate("telemetry")}
                            style={{
                                fontSize: 12,
                                color: "var(--primary)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontFamily: "Inter,sans-serif",
                                fontWeight: 500,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            View all <ArrowRight size={12} />
                        </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {jobs.map((job) => {
                            const st = statusLabel(job.status);
                            return (
                                <button
                                    key={job.id}
                                    id={`overview-job-${job.id}`}
                                    onClick={() => onJobSelect(job.id)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        border: "none",
                                        background: "var(--surface-container-low)",
                                        cursor: "pointer",
                                        textAlign: "left",
                                        transition: "background 0.15s",
                                        width: "100%",
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)", fontFamily: "Manrope,sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {job.name}
                                        </div>
                                        <div style={{ fontSize: 11, color: "var(--on-surface-variant)", fontFamily: "Inter,sans-serif" }}>
                                            {job.framework} · {job.selectedQuant} · {job.inferenceRuns} runs
                                        </div>
                                    </div>
                                    <span
                                        className="chip"
                                        style={{ background: st.bg, color: st.color, flexShrink: 0 }}
                                    >
                                        {st.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Performance Highlights */}
                <div
                    className="animate-fade-in"
                    style={{
                        background: "var(--surface-container-lowest)",
                        borderRadius: 16,
                        padding: "20px 22px",
                        boxShadow: "var(--shadow-ambient)",
                        animationDelay: "260ms",
                    }}
                >
                    <h3 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 15, margin: "0 0 16px" }}>
                        Performance Highlights
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {bestLatency && (
                            <HighlightRow
                                icon={Zap}
                                label="Best Latency"
                                value={`${bestLatency.avgLatencyMs.toFixed(1)} ms`}
                                detail={`${bestLatency.modelName} · ${bestLatency.quantLevel} · ${bestLatency.deviceName}`}
                                color="var(--accent-green)"
                            />
                        )}
                        {summaries.slice(0, 4).map((s, i) => (
                            <HighlightRow
                                key={i}
                                icon={i % 2 === 0 ? Database : TrendingDown}
                                label={`${s.modelName} (${s.quantLevel})`}
                                value={`${s.avgLatencyMs.toFixed(1)} ms`}
                                detail={`RAM: ${s.peakRamMb.toFixed(0)} MB · CPU: ${s.avgCpuPct.toFixed(0)}% · Acc: ${s.top1Accuracy}%`}
                                color={i % 2 === 0 ? "var(--accent-blue)" : "var(--accent-purple)"}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function HighlightRow({
    icon: Icon,
    label,
    value,
    detail,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    detail: string;
    color: string;
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                background: "var(--surface-container-low)",
                borderRadius: 10,
            }}
        >
            <div
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: color + "18",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon size={15} style={{ color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--on-surface)", fontFamily: "Manrope,sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {label}
                </div>
                <div style={{ fontSize: 11, color: "var(--on-surface-variant)", fontFamily: "Inter,sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {detail}
                </div>
            </div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 15, color, flexShrink: 0 }}>
                {value}
            </div>
        </div>
    );
}
