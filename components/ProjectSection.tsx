import ProjectCard, { type ProjectCardData } from "@/components/ProjectCard";

interface ProjectSectionProps {
  slug: string;
  title: string;
  projects: ProjectCardData[];
}

// Una sezione di /progetti (= una categoria). Il titolo della sezione dice già
// la categoria, quindi le card non la ripetono.
export default function ProjectSection({ slug, title, projects }: ProjectSectionProps) {
  const count = projects.length;

  return (
    <section
      id={slug}
      aria-labelledby={`${slug}-title`}
      className="scroll-mt-[calc(var(--header-h)+1.5rem)]"
    >
      <div className="flex items-end justify-between gap-4 mb-6 pb-4 border-b border-graphite/10">
        <h2 id={`${slug}-title`} className="font-serif text-2xl md:text-3xl text-graphite leading-tight">
          {title}
        </h2>
        <span className="text-sm text-gray-400 shrink-0 pb-0.5">
          {count === 1 ? "1 progetto" : `${count} progetti`}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} showCategory={false} />
        ))}
      </div>
    </section>
  );
}
