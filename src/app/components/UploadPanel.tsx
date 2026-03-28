"use client";

import React, { useState, useCallback, useRef } from "react";
import {
    Upload,
    FileCode2,
    Settings2,
    CheckCircle2,
    X,
    AlertTriangle,
    Loader2,
    ChevronDown,
} from "lucide-react";
import { ModelJob, QuantLevel } from "../types";

interface Props {
    onUploadComplete: (job: ModelJob) => void;
}

const QUANT_OPTIONS: { value: QuantLevel; label: string; desc: string }[] = [
    { value: "FP32", label: "FP32", desc: "Baseline — max accuracy, full model size" },
    { value: "FP16", label: "FP16", desc: "~2× size reduction, minimal accuracy drop" },
    { value: "INT8", label: "INT8", desc: "~4× size reduction, notable accuracy impact" },
];

type UploadStage = "idle" | "uploading" | "converting" | "done" | "error";

export default function UploadPanel({ onUploadComplete }: Props) {
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [selectedQuant, setSelectedQuant] = useState<QuantLevel[]>(["FP32", "FP16", "INT8"]);
    const [batchSize, setBatchSize] = useState(1);
    const [inferenceRuns, setInferenceRuns] = useState(50);
    const [stage, setStage] = useState<UploadStage>("idle");
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const ALLOWED_EXTS = [".pt", ".h5", ".pb"];
    const MAX_MB = 500;

    const handleFile = useCallback((f: File) => {
        const ext = "." + f.name.split(".").pop()?.toLowerCase();
        if (!ALLOWED_EXTS.includes(ext)) {
            setErrorMsg(`Unsupported format "${ext}". Accepted: .pt, .h5, .pb`);
            return;
        }
        if (f.size > MAX_MB * 1024 * 1024) {
            setErrorMsg(`File exceeds ${MAX_MB} MB limit (got ${(f.size / 1e6).toFixed(1)} MB).`);
            return;
        }
        setErrorMsg("");
        setFile(f);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
        },
        [handleFile]
    );

    const toggleQuant = (q: QuantLevel) => {
        setSelectedQuant((prev) =>
            prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]
        );
    };

    const simulateJob = async () => {
        if (!file) return;
        if (selectedQuant.length === 0) {
            setErrorMsg("Select at least one quantization level.");
            return;
        }
        setStage("uploading");
        setProgress(0);

        // Simulate upload progress
        for (let p = 0; p <= 100; p += 10) {
            await new Promise((r) => setTimeout(r, 100));
            setProgress(p);
        }
        setStage("converting");
        setProgress(0);

        // Simulate conversion (target ≤ 90 s, we mock it fast)
        const steps = 50;
        for (let i = 0; i <= steps; i++) {
            await new Promise((r) => setTimeout(r, 60));
            setProgress(Math.round((i / steps) * 100));
        }

        const ext = "." + file.name.split(".").pop()?.toLowerCase() as ".pt" | ".h5" | ".pb";
        const newJob: ModelJob = {
            id: `job-${Date.now()}`,
            name: file.name.replace(/\.[^.]+$/, ""),
            framework: ext === ".h5" || ext === ".pb" ? "TensorFlow" : "PyTorch",
            originalFormat: ext,
            sizeBytes: file.size,
            status: "done",
            uploadedAt: new Date().toISOString(),
            convertedAt: new Date().toISOString(),
            quantLevels: selectedQuant,
            selectedQuant: selectedQuant[0],
            batchSize,
            inferenceRuns,
            conversionSeconds: Math.round(40 + Math.random() * 45),
        };

        setStage("done");
        onUploadComplete(newJob);
    };

    const reset = () => {
        setFile(null);
        setStage("idle");
        setProgress(0);
        setErrorMsg("");
    };

    return (
        <div style={{ maxWidth: 780, marginLeft: "auto", marginRight: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="animate-fade-in">
                <h2 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 22, color: "var(--on-surface)", margin: "0 0 4px" }}>
                    Upload AI Model
                </h2>
                <p style={{ fontSize: 14, color: "var(--on-surface-variant)", fontFamily: "Inter,sans-serif", margin: 0 }}>
                    Accepts PyTorch (.pt), TensorFlow (.h5 / .pb) — up to 500 MB. Auto-converts to ONNX / TFLite.
                </p>
            </div>

            {/* Drop Zone */}
            {stage === "idle" && (
                <div
                    id="upload-drop-zone"
                    className={`drop-zone animate-fade-in${dragOver ? " drag-over" : ""}`}
                    style={{
                        padding: "48px 32px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 16,
                        cursor: "pointer",
                        animationDelay: "60ms",
                        position: "relative",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pt,.h5,.pb"
                        style={{ display: "none" }}
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 18,
                            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 8px 24px rgba(1,45,29,0.2)",
                        }}
                    >
                        <Upload size={26} color="white" />
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 16, color: "var(--on-surface)", marginBottom: 4 }}>
                            {file ? file.name : "Drag & drop your model file"}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--on-surface-variant)", fontFamily: "Inter,sans-serif" }}>
                            {file
                                ? `${(file.size / 1e6).toFixed(1)} MB · Click to change`
                                : "or click to browse — .pt · .h5 · .pb · max 500 MB"}
                        </div>
                    </div>
                    {file && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FileCode2 size={14} style={{ color: "var(--primary)" }} />
                            <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600, fontFamily: "Inter,sans-serif" }}>
                                {file.name.endsWith(".pt") ? "PyTorch" : "TensorFlow"} detected
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Error */}
            {errorMsg && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "var(--error-container)",
                        borderRadius: 12,
                        padding: "12px 16px",
                    }}
                >
                    <AlertTriangle size={16} style={{ color: "var(--error)", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "var(--error)", fontFamily: "Inter,sans-serif", flex: 1 }}>
                        {errorMsg}
                    </span>
                    <button
                        onClick={() => setErrorMsg("")}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)" }}
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Config */}
            {stage === "idle" && file && (
                <div
                    className="animate-fade-in"
                    style={{
                        background: "var(--surface-container-lowest)",
                        borderRadius: 16,
                        padding: "22px 24px",
                        boxShadow: "var(--shadow-ambient)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 20,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Settings2 size={16} style={{ color: "var(--primary)" }} />
                        <h3 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 15, margin: 0 }}>
                            Job Configuration
                        </h3>
                    </div>

                    {/* Quantization */}
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)", fontFamily: "Inter,sans-serif", display: "block", marginBottom: 10 }}>
                            Quantization Levels
                        </label>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {QUANT_OPTIONS.map(({ value, label, desc }) => {
                                const active = selectedQuant.includes(value);
                                return (
                                    <button
                                        key={value}
                                        id={`quant-${value}`}
                                        onClick={() => toggleQuant(value)}
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 2,
                                            padding: "10px 16px",
                                            borderRadius: 12,
                                            border: active ? "2px solid var(--primary)" : "2px solid var(--outline-variant)",
                                            background: active ? "rgba(1,45,29,0.06)" : "transparent",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            textAlign: "left",
                                        }}
                                    >
                                        <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 14, color: active ? "var(--primary)" : "var(--on-surface)" }}>
                                            {label}
                                        </span>
                                        <span style={{ fontSize: 11, color: "var(--on-surface-variant)", fontFamily: "Inter,sans-serif" }}>
                                            {desc}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Numeric inputs */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)", fontFamily: "Inter,sans-serif", display: "block", marginBottom: 6 }}>
                                Batch Size
                            </label>
                            <input
                                id="input-batch-size"
                                type="number"
                                min={1}
                                max={32}
                                value={batchSize}
                                onChange={(e) => setBatchSize(Number(e.target.value))}
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: "var(--surface-container-high)",
                                    fontFamily: "Inter,sans-serif",
                                    fontSize: 14,
                                    color: "var(--on-surface)",
                                    outline: "none",
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)", fontFamily: "Inter,sans-serif", display: "block", marginBottom: 6 }}>
                                Inference Runs
                            </label>
                            <input
                                id="input-inference-runs"
                                type="number"
                                min={1}
                                max={200}
                                value={inferenceRuns}
                                onChange={(e) => setInferenceRuns(Number(e.target.value))}
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: "var(--surface-container-high)",
                                    fontFamily: "Inter,sans-serif",
                                    fontSize: 14,
                                    color: "var(--on-surface)",
                                    outline: "none",
                                }}
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 12 }}>
                        <button
                            id="btn-start-job"
                            className="btn-primary"
                            onClick={simulateJob}
                            style={{ padding: "12px 28px", fontSize: 14 }}
                        >
                            Start Benchmark Job
                        </button>
                        <button
                            id="btn-cancel-upload"
                            className="btn-secondary"
                            onClick={reset}
                            style={{ padding: "12px 20px", fontSize: 14 }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Progress */}
            {(stage === "uploading" || stage === "converting") && (
                <div
                    className="animate-fade-in"
                    style={{
                        background: "var(--surface-container-lowest)",
                        borderRadius: 16,
                        padding: "28px 28px",
                        boxShadow: "var(--shadow-ambient)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 18,
                        alignItems: "center",
                    }}
                >
                    <Loader2
                        size={40}
                        className="animate-spin-slow"
                        style={{ color: "var(--primary)" }}
                    />
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 18, color: "var(--on-surface)", marginBottom: 4 }}>
                            {stage === "uploading" ? "Uploading model…" : "Converting & Quantizing…"}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--on-surface-variant)", fontFamily: "Inter,sans-serif" }}>
                            {stage === "converting"
                                ? "Running ONNX export · FP32 → FP16 → INT8 post-training quantization"
                                : `Sending ${(file!.size / 1e6).toFixed(1)} MB to the backend`}
                        </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ width: "100%", maxWidth: 400 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: "var(--on-surface-variant)", fontFamily: "Inter,sans-serif" }}>
                                {stage === "uploading" ? "Upload" : "Conversion"} progress
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)", fontFamily: "Manrope,sans-serif" }}>
                                {progress}%
                            </span>
                        </div>
                        <div style={{ width: "100%", height: 8, borderRadius: 4, background: "var(--surface-container-high)", overflow: "hidden" }}>
                            <div
                                style={{
                                    width: `${progress}%`,
                                    height: "100%",
                                    borderRadius: 4,
                                    background: "linear-gradient(90deg, var(--primary) 0%, var(--primary-fixed) 100%)",
                                    transition: "width 0.15s ease",
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Done */}
            {stage === "done" && (
                <div
                    className="animate-fade-in"
                    style={{
                        background: "var(--success-container)",
                        borderRadius: 16,
                        padding: "24px 28px",
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                    }}
                >
                    <CheckCircle2 size={32} style={{ color: "var(--success)", flexShrink: 0 }} />
                    <div>
                        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 16, color: "var(--success)", marginBottom: 2 }}>
                            Conversion complete — job dispatched!
                        </div>
                        <div style={{ fontSize: 13, color: "var(--on-surface-variant)", fontFamily: "Inter,sans-serif" }}>
                            Navigating to the live telemetry view…
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
