"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ImageCropModal from "@/components/ImageCropModal";
import { addDress, updateDress } from "@/lib/dresses";
import { LETTER_SIZES, NUMERIC_SIZES, OTHER_SIZES } from "@/lib/sizes";
import { Dress } from "@/lib/types";

type DressFormProps = {
  dress?: Dress;
  listedBy: string;
  onSuccess?: () => void;
};

export default function DressForm({ dress, listedBy, onSuccess }: DressFormProps) {
  const router = useRouter();
  const isEditing = !!dress;

  const [images, setImages] = useState<string[]>(dress?.images ?? []);
  const [size, setSize] = useState(dress?.size ?? "");
  const [color, setColor] = useState(dress?.color ?? "");
  const [brand, setBrand] = useState(dress?.brand ?? "");
  const [pricePerMonth, setPricePerMonth] = useState(
    dress ? String(dress.pricePerMonth) : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCropSource(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleCropComplete(cropped: string) {
    setImages((prev) => [...prev, cropped]);
    setCropSource(null);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (images.length === 0) return;

    setSubmitting(true);
    const data = {
      images,
      color: color.trim(),
      brand: brand.trim(),
      size: size.trim(),
      pricePerMonth: Number(pricePerMonth),
      listedBy,
    };

    if (isEditing && dress) {
      updateDress(dress.id, data);
      onSuccess?.();
    } else {
      addDress(data);
      router.push("/browse");
    }
    setSubmitting(false);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
            Pictures
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1.5 block w-full text-sm text-espresso/70 file:mr-4 file:rounded-full file:border-0 file:bg-espresso file:px-4 file:py-2 file:text-sm file:font-medium file:text-cream hover:file:bg-terracotta"
          />
          <span className="mt-1 block text-xs text-espresso/40">
            Each photo opens the crop tool before adding.
          </span>
        </label>

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {images.map((src, index) => (
              <div
                key={index}
                className="relative aspect-[3/4] overflow-hidden rounded-xl bg-sand"
              >
                <Image
                  src={src}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-espresso/80 text-xs text-cream"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
            Size
          </span>
          <select
            required
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
          >
            <option value="">Select size</option>
            <optgroup label="Letter">
              {LETTER_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </optgroup>
            <optgroup label="Numeric">
              {NUMERIC_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </optgroup>
            <optgroup label="Other">
              {OTHER_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </optgroup>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
            Color
          </span>
          <input
            type="text"
            required
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="e.g. Navy, Blush, Emerald"
            className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
            Brand
          </span>
          <input
            type="text"
            required
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Reformation, Zara"
            className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
            Price per month ($)
          </span>
          <input
            type="number"
            required
            min={1}
            value={pricePerMonth}
            onChange={(e) => setPricePerMonth(e.target.value)}
            placeholder="45"
            className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
          />
        </label>

        <button
          type="submit"
          disabled={submitting || images.length === 0}
          className="w-full rounded-full bg-espresso py-3.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isEditing ? "Save changes" : "List to the site"}
        </button>
      </form>

      <ImageCropModal
        imageSrc={cropSource ?? ""}
        open={!!cropSource}
        onClose={() => setCropSource(null)}
        onCrop={handleCropComplete}
      />
    </>
  );
}
