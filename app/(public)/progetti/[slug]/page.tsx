import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/client";
import AspectImage from "@/components/AspectImage";
import StatusBadge from "@/components/StatusBadge";
import ActionButtons from "@/components/ActionButtons";
import { t, parseGallery } from "@/lib/i18n";
import { verifyPreviewToken } from "@/lib/preview-token";
import type { Metadata } from "next";

// DB-backed page: render at request time, never prerender at build.
export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
  searchParams: { preview_token?: string };
}

async function getProject(slug: string, allowUnpublished = false) {
  return prisma.project.findFirst({
    where: allowUnpublished ? { slug } : { slug, published: true },
    include: {
      category: true,
      actions: {
        orderBy: { sort_order: "asc" },
      },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await getProject(params.slug);
  if (!project) return { title: "Progetto non trovato | DeroArts" };

  const title = t(project.title);
  const desc = t(project.short_description);

  return {
    title: `${title} | DeroArts`,
    description: desc,
    openGraph: {
      title: `${title} | DeroArts`,
      description: desc,
      images: project.cover_image_url
        ? [{ url: project.cover_image_url, width: 1280, height: 800, alt: title }]
        : [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "DeroArts" }],
    },
  };
}

export default async function ProjectDetailPage({ params, searchParams }: PageProps) {
  const previewToken = searchParams.preview_token;
  const isValidPreview =
    previewToken != null &&
    verifyPreviewToken(previewToken) === params.slug;

  const project = await getProject(params.slug, isValidPreview);
  if (!project) notFound();

  const title = t(project.title);
  const shortDesc = t(project.short_description);
  const longDesc = t(project.long_description);
  const categoryName = project.category ? t(project.category.name) : null;
  const gallery = parseGallery(project.gallery);
  const enabledActions = project.actions.filter((a) => a.enabled);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8 min-w-0">
        <Link href="/" className="hover:text-graphite transition-colors flex-shrink-0">
          Home
        </Link>
        <span className="flex-shrink-0">/</span>
        <Link href="/progetti" className="hover:text-graphite transition-colors flex-shrink-0">
          Progetti
        </Link>
        <span className="flex-shrink-0">/</span>
        <span className="text-graphite font-medium truncate min-w-0">{title}</span>
      </nav>

      {/* Cover image */}
      <AspectImage
        src={project.cover_image_url}
        alt={title}
        ratio="cover"
        priority
        className="mb-8 shadow-md"
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {categoryName && (
            <span className="text-xs font-semibold text-green-end uppercase tracking-wider">
              {categoryName}
            </span>
          )}
          <StatusBadge status={project.status} size="md" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-graphite mb-3 leading-tight">
          {title}
        </h1>

        {shortDesc && (
          <p className="text-lg text-gray-500 leading-relaxed whitespace-pre-line">
            {shortDesc.replace(/\r\n/g, "\n")}
          </p>
        )}
      </div>

      {/* Action buttons */}
      {enabledActions.length > 0 && (
        <div className="mb-10 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Cosa puoi fare
          </p>
          <ActionButtons
            actions={project.actions}
            projectId={project.id}
            projectTitle={title}
          />
        </div>
      )}

      {/* Long description */}
      {longDesc && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-graphite mb-4">
            Descrizione
          </h2>
          {/* whitespace-pre-line rispetta ESATTAMENTE gli a capo e le righe
              vuote come inseriti nell'admin. Normalizzo i CRLF di Windows. */}
          <div className="max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
            {longDesc.replace(/\r\n/g, "\n")}
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-graphite mb-5">
            Galleria
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gallery.map((item, i) => (
              <AspectImage
                key={i}
                src={item.url}
                alt={t(item.alt)}
                ratio="gallery"
                className="shadow-sm"
              />
            ))}
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="pt-6 border-t border-gray-100">
        <Link
          href="/progetti"
          className="inline-flex items-center gap-2 text-sm font-medium text-green-end hover:underline"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Torna ai progetti
        </Link>
      </div>
    </article>
  );
}
