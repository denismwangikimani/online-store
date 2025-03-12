"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Banner } from "@/types/banner";

export default function HomeBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchActiveBanner() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/shop/banner");
        if (!response.ok) throw new Error("Failed to fetch banner");
        const data = await response.json();
        setBanner(data);
      } catch (error) {
        console.error("Error fetching banner:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchActiveBanner();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-gray-100 animate-pulse flex items-center justify-center">
        <p className="text-gray-400">Loading banner...</p>
      </div>
    );
  }

  if (!banner) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative w-full h-[85vh] mb-8 overflow-hidden rounded-lg">
        <Image
          src={banner.image_url}
          alt={banner.title || "Banner"}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center px-4">
          {banner.title && (
            <h1 className="text-3xl md:text-5xl text-black font-bold mb-4">
              {banner.title}
            </h1>
          )}
          {banner.subtitle && (
            <p className="text-xl md:text-2xl text-black">{banner.subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
