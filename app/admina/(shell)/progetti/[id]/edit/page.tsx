import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import ProjectForm from "@/components/admin/ProjectForm";
import { signPreviewToken } from "@/lib/preview-token";
import { t } from "@/lib/i18n";
export const dynamic = "force-dynamic";

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
    <ProjectForm
      project={project}
      categories={categories}
      heading={`Modifica ${t(project.title) || "progetto"}`}
      previewUrl={previewUrl}
      previewIsSigned={!project.published}
    />
  );
}
