import { useState, useEffect } from "react";
import { Banner } from "@/types/banner";
import ImageUpload from './ImageUpload';
import { useImageUpload } from '@/hooks/useImageUpload';
import toast from "react-hot-toast";

interface BannerFormProps {
  banner?: Banner;
  onSubmit: (banner: Partial<Banner>) => Promise<void>;
  onCancel?: () => void;
  isLoading: boolean;
}

export default function BannerForm({
  banner,
  onSubmit,
  onCancel,
  isLoading,
}: BannerFormProps) {
  const {
    isUploading,
    previewUrl,
    handleImageSelect,
    uploadImage,
  } = useImageUpload('banner');

  const [formData, setFormData] = useState<Partial<Banner>>({
    title: "",
    subtitle: "",
    image_url: "",
    active: true,
  });

  useEffect(() => {
    if (banner) {
      setFormData(banner);
    }
  }, [banner]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = formData.image_url;
      
      const newImageUrl = await uploadImage();
      if (newImageUrl) {
        imageUrl = newImageUrl;
      }

      await onSubmit({
        ...formData,
        image_url: imageUrl,
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error uploading banner image');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
      <div className="px-4 py-6 sm:p-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
              Banner Title
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="col-span-full">
            <label htmlFor="subtitle" className="block text-sm font-medium leading-6 text-gray-900">
              Subtitle
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="subtitle"
                id="subtitle"
                value={formData.subtitle || ''}
                onChange={handleInputChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Banner Image
            </label>
            <ImageUpload
              onImageSelect={handleImageSelect}
              previewUrl={previewUrl || formData.image_url}
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || isUploading}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {isLoading || isUploading ? "Saving..." : banner ? "Update Banner" : "Add Banner"}
        </button>
      </div>
    </form>
  );
}