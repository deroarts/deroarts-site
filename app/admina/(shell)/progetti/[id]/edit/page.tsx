import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import ProjectForm from "@/components/admin/ProjectForm";
import { signPreviewToken } from "@/lib/preview-token";

export const metadata = { title: "Modifica progetto | Admin DeroArts" };

interface PageProps {
  params: { id: string };
}

export default async function EditProjectPage({ params }: PageProps) {
  const [project, categories] = await Promise.all([
    prisma.project.findUnique({
      where: { id: params.id },
      include: { actions: { orderBy: { sort_order: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { sort_order: "asc" } }),
  ]);

  if (!project) notFound();

  // Build the preview URL. Published projects use the plain slug URL;
  // unpublished projects get a short-lived signed token so the page renders.
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const previewUrl = project.published
    ? `${base}/progetti/${project.slug}`
    : `${base}/progetti/${project.slug}?preview_token=${signPreviewToken(project.slug)}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admina/progetti"
            className="text-gray-400 hover:text-graphite transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-graphite">Modifica progetto</h1>
        </div>

        {/* Anteprima — opens public project page in a new tab */}
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-graphite hover:border-green-end hover:text-green-end transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Anteprima
          {!project.published && (
            <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-mono leading-none">
              1h
            </span>
          )}
        </a>
      </div>
      <ProjectForm project={project} categories={categories} />
    </div>
  );
}
