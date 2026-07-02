import { prisma } from "@/lib/db/client";
import CategoryList from "./CategoryList";
export const dynamic = "force-dynamic";

export const metadata = { title: "Categorie | Admin DeroArts" };

export default async function CategoriaPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { projects: true } } },
    orderBy: { sort_order: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-graphite mb-6">Categorie</h1>
      <CategoryList categories={categories} />
    </div>
  );
}
