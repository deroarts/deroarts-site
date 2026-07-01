import Image from "next/image";

interface AspectImageProps {
  src?: string | null;
  alt: string;
  /** "cover" = 16:10, "gallery" = 4:3 */
  ratio: "cover" | "gallery";
  className?: string;
  priority?: boolean;
}

/**
 * Reusable fixed-ratio image container used by both the public site and admin.
 * Shows a branded placeholder when no image URL is provided.
 */
export default function AspectImage({
  src,
  alt,
  ratio,
  className = "",
  priority = false,
}: AspectImageProps) {
  const ratioClass = ratio === "cover" ? "aspect-cover" : "aspect-gallery";

  if (!src) {
    return (
      <div
        className={`${ratioClass} w-full relative overflow-hidden rounded-lg bg-dark-green-gradient flex items-center justify-center ${className}`}
      >
        <svg
          className="w-12 h-12 opacity-30 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`${ratioClass} w-full relative overflow-hidden rounded-lg ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        unoptimized={src.startsWith("http")}
      />
    </div>
  );
}
