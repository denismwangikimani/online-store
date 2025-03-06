"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthProvider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
//import { UserCircleIcon } from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin");
    }
  }, [isLoading, user, router]);

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setEmail(profile.email || "");
      setImageUrl(profile.image_url);
    }
  }, [profile]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError("");

      if (!e.target.files || e.target.files.length === 0) {
        setUploading(false);
        return;
      }

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user!.id}/${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("customer-profiles")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from("customer-profiles")
        .getPublicUrl(filePath);

      const newImageUrl = data.publicUrl;
      setImageUrl(newImageUrl);

      // Update the profile with the new image URL
      const { error: updateError } = await supabase
        .from("customer_profiles")
        .update({ image_url: newImageUrl })
        .eq("id", user!.id);

      if (updateError) {
        throw updateError;
      }

      setMessage("Profile image updated successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Error uploading image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      // Update profile in the database
      const { error: updateError } = await supabase
        .from("customer_profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user!.id);

      if (updateError) {
        throw updateError;
      }

      setMessage("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Error updating profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="mt-6 h-8 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Get initials for avatar placeholder
  const getInitials = () => {
    return (
      `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() ||
      email?.[0]?.toUpperCase() ||
      "U"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold leading-7 text-gray-900">
              Your Profile
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Update your personal information
            </p>
          </div>

          {error && (
            <div className="px-4 sm:px-6 py-2 bg-red-100 border-l-4 border-red-500 text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="px-4 sm:px-6 py-2 bg-green-100 border-l-4 border-green-500 text-green-700">
              {message}
            </div>
          )}

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="sm:flex sm:items-start">
              <div className="sm:flex-shrink-0">
                {imageUrl ? (
                  <div className="relative h-24 w-24 rounded-full overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-medium">
                    {getInitials()}
                  </div>
                )}
              </div>

              <div className="mt-4 sm:mt-0 sm:ml-6">
                <div>
                  <label
                    htmlFor="photo"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Photo
                  </label>
                  <div className="mt-2 flex items-center">
                    <input
                      id="photo"
                      name="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="sr-only"
                    />
                    <label
                      htmlFor="photo"
                      className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    >
                      {uploading ? "Uploading..." : "Change"}
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    JPG, PNG or GIF up to 2MB
                  </p>
                </div>
              </div>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First name
                  </label>
                  <div className="mt-1">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last name
                  </label>
                  <div className="mt-1">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      disabled
                      value={email}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-gray-50 text-gray-500 sm:text-sm"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
