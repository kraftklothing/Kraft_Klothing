"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ImageCropModal from "@/components/ImageCropModal";
import {
  DEFAULT_LISTING_CATEGORY,
  LISTING_CATEGORIES,
  normalizeListingCategory,
} from "@/lib/categories";
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
  const [category, setCategory] = useState(
    dress ? normalizeListingCategory(dress.category) : DEFAULT_LISTING_CATEGORY
  );
  const [color, setColor] = useState(dress?.color ?? "");
  const [brand, setBrand] = useState(dress?.brand ?? "");
  const [name, setName] = useState(dress?.name ?? "");
  const [pricePerMonth, setPricePerMonth] = useState(
    dress ? String(dress.pricePerMonth) : ""
  );
  const [deposit, setDeposit] = useState(
    dress ? String(dress.deposit) : ""
  );
  const [cleaningCharge, setCleaningCharge] = useState(
    dress ? String(dress.cleaningCharge) : ""
  );
  const [source, setSource] = useState(dress?.source ?? "");
  const [purchasePrice, setPurchasePrice] = useState(
    dress ? String(dress.purchasePrice ?? "") : ""
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (images.length === 0) return;

    setSubmitting(true);
    const data = {
      images,
      color: color.trim(),
      brand: brand.trim(),
      name: name.trim(),
      size: size.trim(),
      category,
      pricePerMonth: Number(pricePerMonth),
      deposit: Number(deposit),
      cleaningCharge: Number(cleaningCharge),
      source: source.trim(),
      purchasePrice: Number(purchasePrice) || 0,
      listedBy,
    };

    try {
      if (isEditing && dress) {
        await updateDress(dress.id, data);
        onSuccess?.();
      } else {
        await addDress(data);
        router.push("/browse");
      }
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not save this listing. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
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
            Category
          </span>
          <select
            required
            value={category}
            onChange={(e) => setCategory(normalizeListingCategory(e.target.value))}
            className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
          >
            {LISTING_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

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
            Item name
          </span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Striped Oversized Jacket"
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

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
            Deposit ($)
          </span>
          <input
            type="number"
            required
            min={0}
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder="50"
            className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
            Cleaning Charge ($)
          </span>
          <input
            type="number"
            required
            min={0}
            value={cleaningCharge}
            onChange={(e) => setCleaningCharge(e.target.value)}
            placeholder="15"
            className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
          />
          <span className="mt-1 block text-xs text-espresso/40">
            One Cleaning Charge per rental, deducted from deposit on return.
          </span>
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
            Purchase source
          </span>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. Thrift store, Reformation outlet, Depop"
            className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
          />
          <span className="mt-1 block text-xs text-espresso/40">
            Where you bought this piece — used on the Sales tab.
          </span>
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
            Purchase price ($)
          </span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="28"
            className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
          />
          <span className="mt-1 block text-xs text-espresso/40">
            What you paid for the item. Profit = rental earnings − this cost.
          </span>
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
