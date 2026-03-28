// ─── Core Domain Types ───────────────────────────────────────────────────────

export type QuantLevel = "FP32" | "FP16" | "INT8";
export type JobStatus = "uploading" | "converting" | "ready" | "running" | "done" | "failed";
export type Platform = "Android" | "iOS";
export type Accelerator = "CPU" | "NPU";

export interface ModelJob {
    id: string;
    name: string;
    framework: "PyTorch" | "TensorFlow";
    originalFormat: ".pt" | ".h5" | ".pb";
    sizeBytes: number;
    status: JobStatus;
    uploadedAt: string;
    convertedAt?: string;
    quantLevels: QuantLevel[];
    selectedQuant: QuantLevel;
    batchSize: number;
    inferenceRuns: number;
    conversionSeconds?: number;
}

export interface Device {
    id: string;
    name: string;
    os: Platform;
    osVersion: string;
    chip: string;
    ramTotalMb: number;
    accelerator: Accelerator;
    tier: "high" | "mid";
    connected: boolean;
}

export interface TelemetryRecord {
    modelId: string;
    quantLevel: QuantLevel;
    deviceId: string;
    runIndex: number;
    timestamp: string;
    latencyMsMean: number;
    latencyMsP95: number;
    ramMbPeak: number;
    ramMbDelta: number;
    cpuPctAvg: number;
    cpuPctPeak: number;
    top1Accuracy: number;
    top5Accuracy: number;
    accuracyDeltaVsFp32: number;
}

export interface BenchmarkSummary {
    modelId: string;
    modelName: string;
    deviceId: string;
    deviceName: string;
    quantLevel: QuantLevel;
    avgLatencyMs: number;
    p95LatencyMs: number;
    peakRamMb: number;
    avgCpuPct: number;
    top1Accuracy: number;
    top5Accuracy: number;
    accuracyDelta: number;
    totalRuns: number;
}
