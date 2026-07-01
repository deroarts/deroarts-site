"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { t } from "@/lib/i18n";

interface Category {
  id: string;
  slug: string;
  name: unknown;
}

interface CategoryFilterProps {
  categories: Category[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("categoria") ?? "";

  function select(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!slug) {
      params.delete("categoria");
    } else {
      params.set("categoria", slug);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const base =
    "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border";
  const activeClass =
    "bg-green-gradient text-white border-transparent shadow-sm";
  const inactiveClass =
    "bg-white text-graphite border-gray-200 hover:border-green-end hover:text-green-end";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => select("")}
        className={`${base} ${!active ? activeClass : inactiveClass}`}
      >
        Tutti
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => select(cat.slug)}
          className={`${base} ${active === cat.slug ? activeClass : inactiveClass}`}
        >
          {t(cat.name)}
        </button>
      ))}
    </div>
  );
}
