import { ModelJob, Device, TelemetryRecord, BenchmarkSummary } from "./types";

// ─── Mock Devices ──────────────────────────────────────────────────────────────
export const MOCK_DEVICES: Device[] = [
    {
        id: "dev-001",
        name: "Samsung Galaxy S23",
        os: "Android",
        osVersion: "13",
        chip: "Snapdragon 8 Gen 2",
        ramTotalMb: 8192,
        accelerator: "NPU",
        tier: "high",
        connected: true,
    },
    {
        id: "dev-002",
        name: "Xiaomi Redmi Note 12",
        os: "Android",
        osVersion: "12",
        chip: "Snapdragon 685",
        ramTotalMb: 4096,
        accelerator: "CPU",
        tier: "mid",
        connected: true,
    },
    {
        id: "dev-003",
        name: "iPhone 15 Pro",
        os: "iOS",
        osVersion: "17.4",
        chip: "Apple A17 Pro",
        ramTotalMb: 8192,
        accelerator: "NPU",
        tier: "high",
        connected: false,
    },
];

// ─── Mock Jobs ─────────────────────────────────────────────────────────────────
export const MOCK_JOBS: ModelJob[] = [
    {
        id: "job-001",
        name: "Chest X-Ray CNN",
        framework: "PyTorch",
        originalFormat: ".pt",
        sizeBytes: 48_300_000,
        status: "done",
        uploadedAt: "2026-03-28T10:00:00Z",
        convertedAt: "2026-03-28T10:01:12Z",
        quantLevels: ["FP32", "FP16", "INT8"],
        selectedQuant: "FP16",
        batchSize: 1,
        inferenceRuns: 50,
        conversionSeconds: 72,
    },
    {
        id: "job-002",
        name: "YOLO Car Park Monitor",
        framework: "PyTorch",
        originalFormat: ".pt",
        sizeBytes: 136_800_000,
        status: "done",
        uploadedAt: "2026-03-28T12:30:00Z",
        convertedAt: "2026-03-28T12:31:44Z",
        quantLevels: ["FP32", "FP16", "INT8"],
        selectedQuant: "INT8",
        batchSize: 1,
        inferenceRuns: 50,
        conversionSeconds: 88,
    },
    {
        id: "job-003",
        name: "MobileNet v3",
        framework: "TensorFlow",
        originalFormat: ".h5",
        sizeBytes: 21_500_000,
        status: "converting",
        uploadedAt: "2026-03-28T21:55:00Z",
        quantLevels: ["FP32", "FP16", "INT8"],
        selectedQuant: "FP32",
        batchSize: 1,
        inferenceRuns: 30,
    },
];

// ─── Mock Telemetry (live-stream style, per run index) ─────────────────────────
function generateTelemetryStream(
    modelId: string,
    deviceId: string,
    quantLevel: "FP32" | "FP16" | "INT8",
    baseLat: number,
    baseRam: number,
    baseCpu: number,
    baseAcc: number,
    runs = 50
): TelemetryRecord[] {
    return Array.from({ length: runs }, (_, i) => ({
        modelId,
        quantLevel,
        deviceId,
        runIndex: i + 1,
        timestamp: new Date(Date.UTC(2026, 2, 28, 10, 0, i * 2)).toISOString(),
        latencyMsMean: baseLat + (Math.random() - 0.5) * baseLat * 0.08,
        latencyMsP95: baseLat * 1.12 + (Math.random() - 0.5) * 5,
        ramMbPeak: baseRam + (Math.random() - 0.5) * 20,
        ramMbDelta: baseRam * 0.15 + Math.random() * 8,
        cpuPctAvg: baseCpu + (Math.random() - 0.5) * 5,
        cpuPctPeak: baseCpu * 1.3 + Math.random() * 5,
        top1Accuracy: baseAcc,
        top5Accuracy: Math.min(100, baseAcc + 8),
        accuracyDeltaVsFp32: quantLevel === "FP32" ? 0 : quantLevel === "FP16" ? -0.8 : -3.2,
    }));
}

export const MOCK_TELEMETRY: TelemetryRecord[] = [
    // Chest X-Ray CNN — Galaxy S23 — FP32
    ...generateTelemetryStream("job-001", "dev-001", "FP32", 38, 340, 42, 94.2),
    // Chest X-Ray CNN — Galaxy S23 — FP16
    ...generateTelemetryStream("job-001", "dev-001", "FP16", 22, 195, 35, 93.4),
    // Chest X-Ray CNN — Galaxy S23 — INT8
    ...generateTelemetryStream("job-001", "dev-001", "INT8", 14, 118, 28, 91.0),
    // Chest X-Ray CNN — Redmi Note 12 — FP16
    ...generateTelemetryStream("job-001", "dev-002", "FP16", 61, 210, 58, 93.4),
    // YOLO Car Park — Galaxy S23 — FP32
    ...generateTelemetryStream("job-002", "dev-001", "FP32", 94, 820, 71, 88.5),
    // YOLO Car Park — Galaxy S23 — FP16
    ...generateTelemetryStream("job-002", "dev-001", "FP16", 52, 445, 55, 87.7),
    // YOLO Car Park — Galaxy S23 — INT8
    ...generateTelemetryStream("job-002", "dev-001", "INT8", 31, 268, 44, 85.3),
    // YOLO Car Park — Redmi Note 12 — INT8
    ...generateTelemetryStream("job-002", "dev-002", "INT8", 88, 280, 72, 85.3),
];

// ─── Aggregate Benchmark Summaries ────────────────────────────────────────────
function avgOf(arr: number[]) {
    return arr.reduce((s, x) => s + x, 0) / arr.length;
}

export function buildSummaries(
    jobs: ModelJob[],
    devices: Device[],
    telemetry: TelemetryRecord[]
): BenchmarkSummary[] {
    const groups = new Map<string, TelemetryRecord[]>();
    for (const r of telemetry) {
        const key = `${r.modelId}|${r.deviceId}|${r.quantLevel}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(r);
    }
    const summaries: BenchmarkSummary[] = [];
    for (const [key, records] of groups) {
        const [modelId, deviceId, quantLevel] = key.split("|");
        const job = jobs.find((j) => j.id === modelId);
        const device = devices.find((d) => d.id === deviceId);
        if (!job || !device) continue;
        summaries.push({
            modelId,
            modelName: job.name,
            deviceId,
            deviceName: device.name,
            quantLevel: quantLevel as "FP32" | "FP16" | "INT8",
            avgLatencyMs: avgOf(records.map((r) => r.latencyMsMean)),
            p95LatencyMs: avgOf(records.map((r) => r.latencyMsP95)),
            peakRamMb: Math.max(...records.map((r) => r.ramMbPeak)),
            avgCpuPct: avgOf(records.map((r) => r.cpuPctAvg)),
            top1Accuracy: records[0].top1Accuracy,
            top5Accuracy: records[0].top5Accuracy,
            accuracyDelta: records[0].accuracyDeltaVsFp32,
            totalRuns: records.length,
        });
    }
    return summaries;
}
