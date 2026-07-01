import Link from "next/link";
import { prisma } from "@/lib/db/client";
import ProjectForm from "@/components/admin/ProjectForm";

export const metadata = { title: "Nuovo progetto | Admin DeroArts" };

export default async function NewProjectPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sort_order: "asc" },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/progetti"
          className="text-gray-400 hover:text-graphite transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-graphite">Nuovo progetto</h1>
      </div>
      <ProjectForm categories={categories} />
    </div>
  );
}
