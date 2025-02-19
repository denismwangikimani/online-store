"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BannerForm from "@/app/components/admin/BannerForm";
import { Banner } from "@/types/banner";
import toast from "react-hot-toast";

export default function AddBanner() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (bannerData: Partial<Banner>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bannerData),
      });

      if (!response.ok) throw new Error("Failed to create banner");

      toast.success("Banner added successfully");
      router.push("/admin/banners");
    } catch (error) {
      toast.error("Error creating banner");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Banner</h1>
      </div>
      <BannerForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/banners")}
        isLoading={isLoading}
      />
    </div>
  );
}
