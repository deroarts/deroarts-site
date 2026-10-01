import Link from "next/link";
import AspectImage from "@/components/AspectImage";
import { t } from "@/lib/i18n";
import { htmlToPlainText } from "@/lib/sanitize-html";

export interface ProjectCardData {
  id: string;
  slug: string;
  title: unknown;
  short_description: unknown;
  cover_image_url: string | null;
  status: string;
  /** false = bozza (visibile solo nell'anteprima locale /progetti?bozze=1). */
  published?: boolean;
  category: { name: unknown } | null;
}

interface ProjectCardProps {
  project: ProjectCardData;
  /** Etichetta categoria sotto il titolo (nascosta dove la sezione la dice già). */
  showCategory?: boolean;
}

export default function ProjectCard({ project, showCategory = true }: ProjectCardProps) {
  const title = t(project.title);
  // Card preview: strip rich-text tags so line-clamp works cleanly.
  const shortDesc = htmlToPlainText(t(project.short_description));
  const categoryName =
    showCategory && project.category ? t(project.category.name) : null;

  return (
    <Link
      href={`/progetti/${project.slug}`}
      className="group relative block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
    >
      {project.published === false && (
        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-graphite/85 text-white text-xs font-semibold">
          Bozza
        </span>
      )}
      <AspectImage
        src={project.cover_image_url}
        alt={title}
        ratio="cover"
        className="rounded-none group-hover:scale-[1.02] transition-transform duration-300"
      />

      <div className="p-5">
        <h3 className="font-semibold text-graphite text-lg leading-snug group-hover:text-green-end transition-colors duration-200 mb-2">
          {title}
        </h3>

        {categoryName && (
          <p className="text-xs font-medium text-green-end mb-2 uppercase tracking-wide">
            {categoryName}
          </p>
        )}

        {shortDesc && (
          <p className="text-sm text-gray-500 line-clamp-2">{shortDesc}</p>
        )}

        <div className="mt-4 flex items-center text-sm font-medium text-green-end gap-1">
          <span>Scopri di più</span>
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
