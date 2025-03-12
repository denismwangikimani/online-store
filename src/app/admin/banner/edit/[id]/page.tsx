"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import BannerForm from "@/app/components/admin/BannerForm";
import { Banner } from "@/types/banner";
import toast from "react-hot-toast";

export default function EditBanner() {
  const params = useParams();
  const id = params.id as string;
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch(`/api/banners/${id}`, {
          method: "GET",
        });
        if (!response.ok) throw new Error("Failed to fetch banner");
        const data = await response.json();
        setBanner(data);
      } catch (error) {
        toast.error("Error fetching banner");
        console.error(error);
      }
    };

    fetchBanner();
  }, [id]);

  const handleSubmit = async (bannerData: Partial<Banner>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bannerData),
      });

      if (!response.ok) throw new Error("Failed to update banner");

      toast.success("Banner updated successfully");
      router.push("/admin/banner");
    } catch (error) {
      toast.error("Error updating banner");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Banner</h1>
      </div>
      <BannerForm
        banner={banner || undefined}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/banner")}
        isLoading={isLoading}
      />
    </div>
  );
}
