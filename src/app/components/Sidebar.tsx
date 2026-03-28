"use client";

import React from "react";
import {
    LayoutDashboard,
    Upload,
    Activity,
    BarChart3,
    Smartphone,
    ChevronRight,
    Zap,
    CheckCircle2,
    Loader2,
    XCircle,
    Clock,
} from "lucide-react";
import { ActiveView } from "../page";
import { ModelJob } from "../types";

interface Props {
    open: boolean;
    activeView: ActiveView;
    onNavigate: (v: ActiveView) => void;
    jobs: ModelJob[];
    onJobSelect: (id: string) => void;
}

const NAV_ITEMS: { id: ActiveView; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "upload", label: "Upload Model", icon: Upload },
    { id: "telemetry", label: "Live Telemetry", icon: Activity },
    { id: "compare", label: "Compare", icon: BarChart3 },
    { id: "devices", label: "Devices", icon: Smartphone },
];

function statusIcon(s: ModelJob["status"]) {
    switch (s) {
        case "done": return <CheckCircle2 size={12} style={{ color: "var(--accent-green)" }} />;
        case "converting": return <Loader2 size={12} style={{ color: "var(--accent-orange)", animation: "spin 1.2s linear infinite" }} />;
        case "running": return <Activity size={12} style={{ color: "var(--accent-blue)" }} />;
        case "failed": return <XCircle size={12} style={{ color: "var(--error)" }} />;
        default: return <Clock size={12} style={{ color: "var(--on-surface-variant)" }} />;
    }
}

export default function Sidebar({ open, activeView, onNavigate, jobs, onJobSelect }: Props) {
    return (
        <aside
            style={{
                width: open ? 260 : 0,
                minWidth: open ? 260 : 0,
                background: "var(--surface-container-low)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                transition: "width 0.3s ease, min-width 0.3s ease",
                borderRight: "none",
                flexShrink: 0,
            }}
        >
            {/* Brand */}
            <div
                style={{
                    padding: "24px 20px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexShrink: 0,
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 36,
                        background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)",
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <Zap size={18} color="white" />
                </div>
                <div>
                    <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 16, color: "var(--on-surface)", whiteSpace: "nowrap" }}>
                        EdgeBench
                    </div>
                    <div style={{ fontSize: 11, color: "var(--on-surface-variant)", whiteSpace: "nowrap" }}>
                        MLOps · Edge AI
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ padding: "0 12px", flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--on-surface-variant)", padding: "0 8px 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Navigation
                </div>
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                    const active = activeView === id;
                    return (
                        <button
                            key={id}
                            id={`nav-${id}`}
                            onClick={() => onNavigate(id)}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "10px 12px",
                                marginBottom: 2,
                                borderRadius: 10,
                                border: "none",
                                background: active
                                    ? "linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)"
                                    : "transparent",
                                color: active ? "white" : "var(--on-surface-variant)",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                fontFamily: "Inter, sans-serif",
                                fontWeight: active ? 600 : 400,
                                fontSize: 14,
                                textAlign: "left",
                                whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => {
                                if (!active) {
                                    (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-container)";
                                    (e.currentTarget as HTMLButtonElement).style.color = "var(--on-surface)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!active) {
                                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                    (e.currentTarget as HTMLButtonElement).style.color = "var(--on-surface-variant)";
                                }
                            }}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    );
                })}
            </nav>

            {/* Recent Jobs */}
            <div style={{ padding: "20px 12px 0", flex: 1, overflowY: "auto" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--on-surface-variant)", padding: "0 8px 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Recent Jobs
                </div>
                {jobs.slice(0, 6).map((job) => (
                    <button
                        key={job.id}
                        id={`job-item-${job.id}`}
                        onClick={() => onJobSelect(job.id)}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 12px",
                            marginBottom: 2,
                            borderRadius: 8,
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            transition: "background 0.15s ease",
                            textAlign: "left",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-container)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        }}
                    >
                        {statusIcon(job.status)}
                        <span style={{ flex: 1, fontSize: 13, color: "var(--on-surface)", fontFamily: "Inter,sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {job.name}
                        </span>
                        <ChevronRight size={12} style={{ color: "var(--on-surface-variant)", flexShrink: 0 }} />
                    </button>
                ))}
            </div>

            {/* Footer */}
            <div
                style={{
                    padding: "16px 20px",
                    borderTop: "none",
                    background: "var(--surface-container)",
                    margin: "12px",
                    borderRadius: 12,
                    flexShrink: 0,
                }}
            >
                <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 12, fontWeight: 700, color: "var(--primary)", marginBottom: 2 }}>
                    Phase 4 — Dashboard
                </div>
                <div style={{ fontSize: 11, color: "var(--on-surface-variant)", lineHeight: 1.4 }}>
                    Final Year Project · CS · 2026
                </div>
            </div>
        </aside>
    );
}
