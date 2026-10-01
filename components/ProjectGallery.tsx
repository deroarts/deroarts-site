"use client";

import { useState } from "react";
import AspectImage from "@/components/AspectImage";
import Lightbox from "@/components/Lightbox";

export interface GalleryImage {
  url: string;
  alt: string;
}

// Galleria del dettaglio progetto: ogni miniatura si apre a schermo intero
// nello stesso modo (Lightbox), con l'immagine alla sua risoluzione piena.
export default function ProjectGallery({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {images.map((img, i) => (
          <button
            key={`${img.url}-${i}`}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={`Apri immagine ${i + 1} di ${images.length}${img.alt ? `: ${img.alt}` : ""}`}
            className="group block w-full rounded-lg cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-end"
          >
            <AspectImage
              src={img.url}
              alt={img.alt}
              ratio="gallery"
              className="shadow-sm transition-shadow duration-300 group-hover:shadow-md"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          images={images}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
