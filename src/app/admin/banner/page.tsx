"use client";
import { useState, useEffect, useCallback } from "react";
import { Banner } from "@/types/banner";
import BannerForm from "@/app/components/admin/BannerForm";
import BannerList from "@/app/components/admin/BannerList";
import toast from "react-hot-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { deleteBannerImage } from "@/services/storage";

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  const fetchBanners = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("banners").select("*");
      if (error) throw error;
      setBanners(data);
    } catch (error) {
      toast.error("Error fetching banners");
      console.error(error);
    }
  }, [supabase]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleSubmit = async (bannerData: Partial<Banner>) => {
    setIsLoading(true);
    try {
      if (selectedBanner) {
        // Update existing banner
        if (
          selectedBanner.image_url &&
          bannerData.image_url &&
          bannerData.image_url !== selectedBanner.image_url
        ) {
          await deleteBannerImage(selectedBanner.image_url);
        }

        const { error } = await supabase
          .from("banners")
          .update(bannerData)
          .eq("id", selectedBanner.id);

        if (error) throw error;

        toast.success("Banner updated successfully");
      } else {
        // Create new banner
        const { error } = await supabase.from("banners").insert([bannerData]);

        if (error) throw error;

        toast.success("Banner created successfully");
      }
      fetchBanners();
      //restart the banner
      setSelectedBanner(null);
    } catch (error) {
      toast.error("Error saving banner");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
  };

  const handleDelete = async (id: number, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    setIsLoading(true);
    try {
      if (imageUrl) {
        await deleteBannerImage(imageUrl);
      }

      const { error } = await supabase.from("banners").delete().eq("id", id);

      if (error) throw error;

      toast.success("Banner deleted successfully");
      fetchBanners();
    } catch (error) {
      toast.error("Error deleting banner");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {selectedBanner ? "Edit Banner" : "Create Banner"}
        </h1>
      </div>
      <div className="mt-8 mb-16">
        <h2 className="text-xl font-bold text-gray-900">Existing Banners</h2>
        <BannerList
          banners={banners}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <BannerForm
        banner={selectedBanner || undefined}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={() => setSelectedBanner(null)}
      />
    </div>
  );
}
