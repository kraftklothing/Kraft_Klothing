"use client";

import { useEffect, useRef, useState } from "react";

type ImageCropModalProps = {
  imageSrc: string;
  open: boolean;
  onClose: () => void;
  onCrop: (croppedDataUrl: string) => void;
};

const ASPECT = 3 / 4;

export default function ImageCropModal({
  imageSrc,
  open,
  onClose,
  onCrop,
}: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!open || !imageSrc) return;
    const img = new window.Image();
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      setScale(1);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [open, imageSrc]);

  useEffect(() => {
    if (!open || !imageLoaded || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imageRef.current;
    const cw = canvas.width;
    const ch = canvas.height;

    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = "#E8E0D4";
    ctx.fillRect(0, 0, cw, ch);

    const baseScale = Math.max(cw / img.width, ch / img.height);
    const drawScale = baseScale * scale;
    const drawW = img.width * drawScale;
    const drawH = img.height * drawScale;
    const drawX = (cw - drawW) / 2 + offset.x;
    const drawY = (ch - drawH) / 2 + offset.y;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    ctx.fillStyle = "rgba(44, 24, 16, 0.45)";
    ctx.fillRect(0, 0, cw, ch);
    ctx.clearRect(0, 0, cw, ch);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, cw, ch);
    ctx.clip();
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    ctx.strokeStyle = "#C4714A";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, cw - 2, ch - 2);
  }, [open, imageLoaded, scale, offset]);

  function handlePointerDown(e: React.PointerEvent) {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }

  function handleApply() {
    if (!imageRef.current || !canvasRef.current) return;

    const img = imageRef.current;
    const preview = canvasRef.current;
    const cw = preview.width;
    const ch = preview.height;

    const baseScale = Math.max(cw / img.width, ch / img.height);
    const drawScale = baseScale * scale;
    const drawW = img.width * drawScale;
    const drawH = img.height * drawScale;
    const drawX = (cw - drawW) / 2 + offset.x;
    const drawY = (ch - drawH) / 2 + offset.y;

    const output = document.createElement("canvas");
    output.width = 640;
    output.height = Math.round(640 / ASPECT);
    const ctx = output.getContext("2d");
    if (!ctx) return;

    const scaleX = output.width / cw;
    const scaleY = output.height / ch;
    ctx.drawImage(
      img,
      drawX * scaleX,
      drawY * scaleY,
      drawW * scaleX,
      drawH * scaleY
    );

    onCrop(output.toDataURL("image/jpeg", 0.72));
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-sand bg-cream p-6 shadow-xl">
        <h2 className="font-serif text-2xl text-espresso">Crop image</h2>
        <p className="mt-1 text-sm text-espresso/60">
          Drag to reposition. Use zoom to adjust framing.
        </p>

        <div className="mt-4 overflow-hidden rounded-xl border border-sand bg-sand">
          <canvas
            ref={canvasRef}
            width={300}
            height={400}
            className="mx-auto block w-full max-w-[300px] cursor-grab touch-none active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDragging(false)}
            onPointerLeave={() => setDragging(false)}
          />
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
            Zoom
          </span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="mt-2 w-full accent-terracotta"
          />
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-sand py-2.5 text-sm font-medium text-espresso"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!imageLoaded}
            className="flex-1 rounded-full bg-espresso py-2.5 text-sm font-medium text-cream hover:bg-terracotta disabled:opacity-40"
          >
            Apply crop
          </button>
        </div>
      </div>
    </div>
  );
}
