"use client";

import { Upload } from "lucide-react";
import Image from "next/image";

interface ProfileImageProps {
  imageUrl: string | null;
  name: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accentColor?: string;
}

export function ProfileImage({
  imageUrl,
  name,
  onImageChange,
  accentColor = "primary"
}: ProfileImageProps) {
  const imagePreview = imageUrl;
  const buttonBgColor = accentColor === "green" ? "bg-green-500" : "bg-primary";

  return (
    <div className="flex justify-center mb-6">
      <div className="relative">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border">
          {imagePreview ? (
            <Image 
              src={imagePreview} 
              alt="Profile" 
              width={96} 
              height={96} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
              <span className="text-2xl">
                {name ? name.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
          )}
        </div>
        <label htmlFor="profile-image" className={`absolute -bottom-2 -right-2 ${buttonBgColor} text-white p-1 rounded-full cursor-pointer`}>
          <Upload className="h-4 w-4" />
          <input 
            type="file" 
            id="profile-image" 
            className="hidden" 
            accept="image/*"
            onChange={onImageChange}
          />
        </label>
      </div>
    </div>
  );
}
