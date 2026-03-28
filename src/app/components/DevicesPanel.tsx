"use client";

import React from "react";
import { Smartphone, Wifi, WifiOff, Cpu, MemoryStick, Layers } from "lucide-react";
import { Device } from "../types";

interface Props {
    devices: Device[];
}

export default function DevicesPanel({ devices }: Props) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="animate-fade-in">
                <h2 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 22, margin: "0 0 4px" }}>
                    Edge Profiling Nodes
                </h2>
                <p style={{ fontSize: 14, color: "var(--on-surface-variant)", fontFamily: "Inter,sans-serif", margin: 0 }}>
                    Physical devices running the .NET MAUI profiler client. ONNX Runtime inference + native OS telemetry.
                </p>
            </div>

            {/* Summary row */}
            <div
                className="animate-fade-in"
                style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, animationDelay: "40ms" }}
            >
                <SummaryCard
                    label="Total Nodes"
                    value={devices.length}
                    color="var(--accent-blue)"
                    bg="rgba(59,130,246,0.1)"
                />
                <SummaryCard
                    label="Online"
                    value={devices.filter((d) => d.connected).length}
                    color="var(--accent-green)"
                    bg="rgba(16,185,129,0.1)"
                />
                <SummaryCard
                    label="Offline"
                    value={devices.filter((d) => !d.connected).length}
                    color="var(--on-surface-variant)"
                    bg="var(--surface-container)"
                />
            </div>

            {/* Device cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
                {devices.map((device, i) => (
                    <DeviceCard key={device.id} device={device} delay={i * 60} />
                ))}
            </div>

            {/* Protocol info */}
            <div
                className="animate-fade-in"
                style={{
                    background: "var(--surface-container-lowest)",
                    borderRadius: 16,
                    padding: "20px 24px",
                    boxShadow: "var(--shadow-ambient)",
                    animationDelay: "240ms",
                }}
            >
                <h3 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 15, margin: "0 0 14px" }}>
                    Communication Protocol
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                    {[
                        { label: "Job Dispatch", proto: "WebSocket", dir: "Backend → MAUI", color: "var(--accent-blue)" },
                        { label: "Telemetry Stream", proto: "WebSocket", dir: "MAUI → Backend", color: "var(--accent-green)" },
                        { label: "Model Download", proto: "OTA (HTTP)", dir: "Backend → MAUI", color: "var(--accent-purple)" },
                        { label: "Status Queries", proto: "REST GET", dir: "Dashboard ← Backend", color: "var(--accent-orange)" },
                    ].map((row) => (
                        <div
                            key={row.label}
                            style={{
                                background: "var(--surface-container-low)",
                                borderRadius: 10,
                                padding: "12px 14px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                            }}
                        >
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--on-surface)", fontFamily: "Manrope,sans-serif" }}>
                                {row.label}
                            </span>
                            <span className="chip" style={{ background: row.color + "18", color: row.color, fontSize: 11, width: "fit-content" }}>
                                {row.proto}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--on-surface-variant)", fontFamily: "Inter,sans-serif" }}>
                                {row.dir}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
    return (
        <div
            style={{
                background: "var(--surface-container-lowest)",
                borderRadius: 14,
                padding: "18px 20px",
                boxShadow: "var(--shadow-ambient)",
                display: "flex",
                alignItems: "center",
                gap: 14,
            }}
        >
            <div
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Smartphone size={18} style={{ color }} />
            </div>
            <div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 26, color, lineHeight: 1 }}>
                    {value}
                </div>
                <div style={{ fontSize: 12, color: "var(--on-surface-variant)", fontFamily: "Inter,sans-serif", marginTop: 2 }}>
                    {label}
                </div>
            </div>
        </div>
    );
}

function DeviceCard({ device, delay }: { device: Device; delay: number }) {
    const tier = device.tier === "high" ? { label: "High-tier", color: "var(--accent-purple)", bg: "rgba(139,92,246,0.12)" } : { label: "Mid-tier", color: "var(--accent-blue)", bg: "rgba(59,130,246,0.12)" };

    return (
        <div
            id={`device-card-${device.id}`}
            className="animate-fade-in"
            style={{
                background: "var(--surface-container-lowest)",
                borderRadius: 16,
                padding: "20px 22px",
                boxShadow: "var(--shadow-ambient)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                animationDelay: `${delay}ms`,
                transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-elevated)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-ambient)";
            }}
        >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: device.connected ? "rgba(16,185,129,0.12)" : "var(--surface-container)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <Smartphone size={20} style={{ color: device.connected ? "var(--accent-green)" : "var(--on-surface-variant)" }} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 15, color: "var(--on-surface)", marginBottom: 2 }}>
                        {device.name}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span className="chip" style={{ background: tier.bg, color: tier.color, fontSize: 11 }}>
                            {tier.label}
                        </span>
                        <span className="chip" style={{ background: device.os === "Android" ? "rgba(59,130,246,0.1)" : "var(--surface-container)", color: device.os === "Android" ? "var(--accent-blue)" : "var(--on-surface-variant)", fontSize: 11 }}>
                            {device.os} {device.osVersion}
                        </span>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {device.connected ? (
                        <Wifi size={14} style={{ color: "var(--accent-green)" }} />
                    ) : (
                        <WifiOff size={14} style={{ color: "var(--on-surface-variant)" }} />
                    )}
                    <span style={{ fontSize: 12, fontWeight: 600, color: device.connected ? "var(--accent-green)" : "var(--on-surface-variant)", fontFamily: "Inter,sans-serif" }}>
                        {device.connected ? "Online" : "Offline"}
                    </span>
                </div>
            </div>

            {/* Specs grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <SpecRow icon={Cpu} label="Chip" value={device.chip} />
                <SpecRow icon={MemoryStick} label="RAM" value={`${(device.ramTotalMb / 1024).toFixed(0)} GB`} />
                <SpecRow icon={Layers} label="Accelerator" value={device.accelerator} highlight={device.accelerator === "NPU"} />
                <SpecRow icon={Smartphone} label="Platform" value={device.os} />
            </div>
        </div>
    );
}

function SpecRow({ icon: Icon, label, value, highlight }: { icon: React.ElementType; label: string; value: string; highlight?: boolean }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--surface-container-low)",
                borderRadius: 8,
                padding: "8px 10px",
            }}
        >
            <Icon size={13} style={{ color: highlight ? "var(--accent-green)" : "var(--on-surface-variant)", flexShrink: 0 }} />
            <div>
                <div style={{ fontSize: 10, color: "var(--on-surface-variant)", fontFamily: "Inter,sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {label}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: highlight ? "var(--accent-green)" : "var(--on-surface)", fontFamily: "Manrope,sans-serif" }}>
                    {value}
                </div>
            </div>
        </div>
    );
}
