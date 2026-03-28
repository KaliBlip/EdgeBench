import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EdgeBench — AI Model Benchmarking on Edge Devices",
  description:
    "Automated MLOps pipeline for benchmarking AI models on edge devices. Upload, convert, deploy, and visualise hardware telemetry across Android and iOS.",
  keywords: ["MLOps", "edge AI", "model benchmarking", "ONNX", "TFLite", "telemetry"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: "var(--surface)", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
