"use client";

import React from "react";
import { Menu, Wifi, Bell, Search } from "lucide-react";
import { ActiveView } from "../page";

const VIEW_TITLES: Record<ActiveView, { title: string; subtitle: string }> = {
    overview: { title: "Overview", subtitle: "Dashboard summary & recent activity" },
    upload: { title: "Upload Model", subtitle: "Drag-and-drop PyTorch / TensorFlow models" },
    telemetry: { title: "Live Telemetry", subtitle: "Real-time hardware metrics from edge devices" },
    compare: { title: "Compare", subtitle: "Side-by-side quantization & device comparison" },
    devices: { title: "Devices", subtitle: "Connected edge profiling nodes" },
};

interface Props {
    activeView: ActiveView;
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
    connectedDevices: number;
}

export default function Header({ activeView, sidebarOpen, onToggleSidebar, connectedDevices }: Props) {
    const { title, subtitle } = VIEW_TITLES[activeView];

    return (
        <header
            className="glass"
            style={{
                height: 64,
                display: "flex",
                alignItems: "center",
                padding: "0 28px",
                gap: 16,
                flexShrink: 0,
                borderBottom: "1px solid rgba(193,200,194,0.2)",
                position: "sticky",
                top: 0,
                zIndex: 10,
            }}
        >
            {/* Sidebar Toggle */}
            <button
                id="sidebar-toggle"
                onClick={onToggleSidebar}
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: "none",
                    background: "var(--surface-container)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--on-surface-variant)",
                    flexShrink: 0,
                    transition: "background 0.2s",
                }}
            >
                <Menu size={18} />
            </button>

            {/* Title */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <h1
                    style={{
                        fontFamily: "Manrope, sans-serif",
                        fontWeight: 800,
                        fontSize: 18,
                        color: "var(--on-surface)",
                        lineHeight: 1.2,
                        margin: 0,
                    }}
                >
                    {title}
                </h1>
                <p style={{ fontSize: 12, color: "var(--on-surface-variant)", margin: 0, fontFamily: "Inter,sans-serif" }}>
                    {subtitle}
                </p>
            </div>

            {/* Search */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "var(--surface-container)",
                    borderRadius: 10,
                    padding: "6px 12px",
                    width: 200,
                }}
            >
                <Search size={14} style={{ color: "var(--on-surface-variant)" }} />
                <input
                    id="header-search"
                    placeholder="Search jobs…"
                    style={{
                        border: "none",
                        background: "transparent",
                        fontFamily: "Inter,sans-serif",
                        fontSize: 13,
                        color: "var(--on-surface)",
                        outline: "none",
                        width: "100%",
                    }}
                />
            </div>

            {/* Connected Devices Badge */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: connectedDevices > 0 ? "rgba(16,185,129,0.12)" : "var(--surface-container)",
                    borderRadius: 9999,
                    padding: "6px 12px",
                }}
            >
                <div
                    style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: connectedDevices > 0 ? "var(--accent-green)" : "var(--outline-variant)",
                        animation: connectedDevices > 0 ? "pulse-glow 2s ease infinite" : "none",
                        flexShrink: 0,
                    }}
                />
                <Wifi size={13} style={{ color: connectedDevices > 0 ? "var(--accent-green)" : "var(--on-surface-variant)" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: connectedDevices > 0 ? "var(--accent-green)" : "var(--on-surface-variant)", fontFamily: "Inter,sans-serif" }}>
                    {connectedDevices} connected
                </span>
            </div>

            {/* Notifications */}
            <button
                id="notifications-btn"
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: "none",
                    background: "var(--surface-container)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--on-surface-variant)",
                    position: "relative",
                    flexShrink: 0,
                }}
            >
                <Bell size={16} />
                <span
                    style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "var(--accent-orange)",
                        border: "2px solid var(--surface-container-low)",
                    }}
                />
            </button>
        </header>
    );
}
