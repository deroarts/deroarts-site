interface CategoryNavProps {
  items: { slug: string; title: string }[];
}

// Scorciatoie verso le sezioni di /progetti (ancore, nessun JS).
// Su mobile scorre in orizzontale dentro il proprio box: la pagina non scorre.
export default function CategoryNav({ items }: CategoryNavProps) {
  return (
    <nav
      aria-label="Sezioni dei progetti"
      className="-mx-4 px-4 sm:mx-0 sm:px-0 mb-12 overflow-x-auto [scrollbar-width:none]"
    >
      <ul className="flex sm:flex-wrap gap-2 w-max sm:w-auto">
        {items.map((item) => (
          <li key={item.slug}>
            <a
              href={`#${item.slug}`}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-graphite/10 text-sm font-medium text-graphite whitespace-nowrap hover:border-green-end/40 hover:text-green-end transition-colors"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
