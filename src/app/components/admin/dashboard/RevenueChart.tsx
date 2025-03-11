"use client";

import { useEffect, useRef } from "react";
import { RevenueDataPoint } from "@/types/dashboard";

interface RevenueChartProps {
  data: RevenueDataPoint[];
  timeframe: "week" | "month" | "year";
}

export default function RevenueChart({ data, timeframe }: RevenueChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Chart dimensions
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Find max value for scaling
    const maxRevenue = Math.max(...data.map((item) => item.amount)) * 1.1; // Add 10% padding

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.strokeStyle = "#e5e7eb"; // Gray-200
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Y-axis labels
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#6b7280"; // Gray-500
    ctx.textAlign = "right";

    const yLabelCount = 5;
    for (let i = 0; i <= yLabelCount; i++) {
      const y = padding + chartHeight - (i * chartHeight) / yLabelCount;
      const value = ((i * maxRevenue) / yLabelCount).toFixed(0);

      ctx.fillText(`$${value}`, padding - 10, y + 4);

      // Draw horizontal grid line
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.strokeStyle = "#f3f4f6"; // Gray-100
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw data points
    if (data.length > 1) {
      const barWidth = chartWidth / data.length / 1.5;

      // Draw X-axis labels and bars
      data.forEach((point, index) => {
        const x = padding + (index + 0.5) * (chartWidth / data.length);
        const barHeight = (point.amount / maxRevenue) * chartHeight;
        const y = height - padding - barHeight;

        // Draw bar
        ctx.fillStyle = "#6366f1"; // Indigo-500
        ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);

        // Draw label
        ctx.fillStyle = "#6b7280"; // Gray-500
        ctx.textAlign = "center";
        ctx.fillText(point.date, x, height - padding + 20);
      });
    }

    // Add title
    ctx.fillStyle = "#111827"; // Gray-900
    ctx.textAlign = "center";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(
      `Revenue Over ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}`,
      width / 2,
      20
    );
  }, [data, timeframe]);

  return (
    <div className="bg-white shadow rounded-lg p-4 overflow-hidden">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Revenue Overview
      </h3>
      <div className="h-80 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No revenue data available</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="h-full w-full"
          ></canvas>
        )}
      </div>
    </div>
  );
}
