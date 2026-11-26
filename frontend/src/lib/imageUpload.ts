/** Shrinks a photo in the browser and returns it as a data URL (WebP where the browser can). */
export async function compressImage(file: File, maxSide = 1400): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  const bitmap = await createImageBitmap(file);
  const encode = (side: number, quality: number) => {
    const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser could not process this image.");
    let url = canvas.toDataURL("image/webp", quality);
    if (!url.startsWith("data:image/webp")) {
      // Older browsers cannot encode WebP: fall back to JPEG on white (no transparency).
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      url = canvas.toDataURL("image/jpeg", quality);
    } else {
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      url = canvas.toDataURL("image/webp", quality);
    }
    return url;
  };
  let url = encode(maxSide, 0.82);
  // Keep demo storage small: try once more, smaller, if the photo is still large (about 300 KB).
  if (url.length > 400_000) url = encode(1000, 0.7);
  bitmap.close();
  return url;
}
