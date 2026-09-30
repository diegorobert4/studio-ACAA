import Link from 'next/link';
import { FolderKanban, Image as ImageIcon, Newspaper, Clock } from 'lucide-react';
import { initialProjects, ProjectStatus } from '@/data';

// data.ts no guarda fecha de edición: el "último" proyecto es el de año más
// reciente y, a igual año, el de mayor `order`.
function getLatestProject() {
  return [...initialProjects].sort(
    (a, b) => Number(b.year) - Number(a.year) || b.order - a.order,
  )[0];
}

const rowGrid =
  'grid min-w-[60rem] grid-cols-[minmax(10rem,1.4fr)_8rem_4rem_minmax(9rem,1fr)_6rem_minmax(9rem,1fr)_5rem] items-center gap-4 px-4';

const statusStyles: Record<ProjectStatus, string> = {
  Anteproyecto: 'bg-estado-anteproyecto text-estado-anteproyecto-fg',
  Completado: 'bg-estado-completado text-estado-completado-fg',
  'En obra': 'bg-estado-en-obra text-estado-en-obra-fg',
};

export default function AdminDashboard() {
  const totalImages = initialProjects.reduce((sum, p) => sum + p.images.length, 0);
  const totalPublications = initialProjects.reduce(
    (sum, p) => sum + (p.publications?.length ?? 0),
    0,
  );
  const latest = getLatestProject();

  const card = 'border border-neutral-200 bg-white p-4';
  const value = 'font-heading text-3xl font-bold tracking-tight text-neutral-900';
  const label = 'mt-1.5 font-mono text-[11px] uppercase tracking-widest text-neutral-500';
  const icon = 'mb-3 text-blueprint';

  return (
    <div>
      <h1 className="font-heading text-4xl font-bold tracking-tight text-neutral-900">
        Dashboard
      </h1>

      <div className="mt-10 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className={card}>
          <FolderKanban size={20} className={icon} />
          <p className={value}>{initialProjects.length}</p>
          <p className={label}>Total de proyectos</p>
        </div>

        <div className={card}>
          <ImageIcon size={20} className={icon} />
          <p className={value}>{totalImages}</p>
          <p className={label}>Imágenes cargadas</p>
        </div>

        <div className={card}>
          <Newspaper size={20} className={icon} />
          <p className={value}>{totalPublications}</p>
          <p className={label}>Publicaciones registradas</p>
        </div>

        <div className={card}>
          <Clock size={20} className={icon} />
          <p className={`${value} truncate`}>{latest.title}</p>
          <p className={label}>Último proyecto · {latest.year}</p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900">
          Proyectos
        </h2>

        <div className="mt-6 overflow-x-auto border border-neutral-200 bg-white">
          <div
            className={`${rowGrid} border-b border-neutral-200 py-3 font-mono text-xs uppercase tracking-widest text-neutral-500`}
          >
            <div>Nombre</div>
            <div>Estado</div>
            <div>Año</div>
            <div>Ubicación</div>
            <div>Superficie</div>
            <div>Colaboradores</div>
            <div>Imágenes</div>
          </div>

          <div className="divide-y divide-neutral-200">
            {initialProjects.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className={`${rowGrid} py-4 text-sm text-neutral-900 transition-colors hover:bg-neutral-50 hover:text-blueprint`}
              >
                <div className="truncate font-medium">{project.title}</div>
                <div>
                  <span
                    className={`inline-block px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider ${statusStyles[project.status]}`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="text-neutral-600">{project.year}</div>
                <div className="truncate text-neutral-600">{project.location}</div>
                <div className="text-neutral-600">{project.area.replace('m2', 'm²')}</div>
                <div className="truncate text-neutral-600">{project.collaborators ?? '—'}</div>
                <div className="text-neutral-600">{project.images.length}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
