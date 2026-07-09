import { prisma } from "@/lib/db/client";
import ProjectForm from "@/components/admin/ProjectForm";
export const dynamic = "force-dynamic";

export const metadata = { title: "Nuovo progetto | Admin DeroArts" };

export default async function NewProjectPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sort_order: "asc" },
  });

  return <ProjectForm categories={categories} heading="Nuovo progetto" />;
}
