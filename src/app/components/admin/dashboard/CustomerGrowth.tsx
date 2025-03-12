"use client";

import { useEffect, useRef } from "react";
import { CustomerGrowthPoint } from "@/types/dashboard";

interface CustomerGrowthProps {
  data: CustomerGrowthPoint[];
  timeframe: "week" | "month" | "year";
}

export default function CustomerGrowth({
  data,
  timeframe,
}: CustomerGrowthProps) {
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
    const maxCount = Math.max(...data.map((item) => item.count)) * 1.1; // Add 10% padding

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
      const value = Math.round((i * maxCount) / yLabelCount);

      ctx.fillText(`${value}`, padding - 10, y + 4);

      // Draw horizontal grid line
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.strokeStyle = "#f3f4f6"; // Gray-100
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw line chart
    if (data.length > 1) {
      const pointWidth = chartWidth / (data.length - 1);

      // Draw X-axis labels
      data.forEach((point, index) => {
        const x = padding + index * pointWidth;

        // Draw label (only for some points to avoid overcrowding)
        if (
          index === 0 ||
          index === data.length - 1 ||
          index % Math.ceil(data.length / 5) === 0
        ) {
          ctx.fillStyle = "#6b7280"; // Gray-500
          ctx.textAlign = "center";
          ctx.fillText(point.date, x, height - padding + 20);
        }
      });

      // Draw the line
      ctx.beginPath();
      data.forEach((point, index) => {
        const x = padding + index * pointWidth;
        const y = height - padding - (point.count / maxCount) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.strokeStyle = "#6366f1"; // Indigo-500
      ctx.lineWidth = 2;
      ctx.stroke();

      // Add area fill
      //const lastPoint = data[data.length - 1];
      const lastX = padding + (data.length - 1) * pointWidth;
      //const lastY =
        //height - padding - (lastPoint.count / maxCount) * chartHeight;

      ctx.lineTo(lastX, height - padding);
      ctx.lineTo(padding, height - padding);
      ctx.fillStyle = "rgba(99, 102, 241, 0.1)"; // Indigo-500 with opacity
      ctx.fill();
      // Draw dots for each data point
      data.forEach((point, index) => {
        const x = padding + index * pointWidth;
        const y = height - padding - (point.count / maxCount) * chartHeight;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#6366f1"; // Indigo-500
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      });
    }

    // Add title
    ctx.fillStyle = "#111827"; // Gray-900
    ctx.textAlign = "center";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(
      `Customer Growth - ${
        timeframe.charAt(0).toUpperCase() + timeframe.slice(1)
      }`,
      width / 2,
      20
    );
  }, [data, timeframe]);

  return (
    <div className="bg-white shadow rounded-lg p-4 overflow-hidden">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Customer Growth
      </h3>
      <div className="h-80 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No customer data available</p>
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
      <div className="mt-2 text-center">
        <p className="text-sm text-gray-500">
          Total customers: {data.length > 0 ? data[data.length - 1].count : 0}
        </p>
      </div>
    </div>
  );
}
