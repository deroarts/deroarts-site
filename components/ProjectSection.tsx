import ProjectCard, { type ProjectCardData } from "@/components/ProjectCard";

interface ProjectSectionProps {
  slug: string;
  title: string;
  projects: ProjectCardData[];
}

// Colonne occupate nella griglia di /progetti: tante quanti i progetti, fino a
// riempire la riga. Così le sezioni piccole stanno affiancate e quelle grandi
// prendono la riga intera. Nomi di classe completi: Tailwind li deve vedere.
const SPAN = [
  "col-span-1",
  "col-span-1",
  "col-span-1 sm:col-span-2",
  "col-span-1 sm:col-span-2 lg:col-span-3",
];

// Una sezione di /progetti (= una categoria). Usa le colonne della griglia
// esterna (subgrid): le card di tutte le sezioni restano allineate. Il titolo
// della sezione dice già la categoria, quindi le card non la ripetono.
export default function ProjectSection({ slug, title, projects }: ProjectSectionProps) {
  const span = SPAN[Math.min(projects.length, SPAN.length - 1)];

  return (
    <section
      id={slug}
      aria-labelledby={`${slug}-title`}
      className={`${span} grid grid-cols-subgrid content-start gap-y-6`}
    >
      <h2
        id={`${slug}-title`}
        className="col-span-full font-serif text-2xl text-graphite leading-tight pb-3 border-b border-graphite/10"
      >
        {title}
      </h2>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} showCategory={false} />
      ))}
    </section>
  );
}
