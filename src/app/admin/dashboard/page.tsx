import Link from 'next/link';
import { FolderKanban, Image as ImageIcon, Newspaper, Clock } from 'lucide-react';
import type { Project, ProjectStatus } from '@/data';
import { getAdminProjects } from '@/lib/projects';

function getLatestProject(projects: Project[]) {
  return [...projects].sort(
    (a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''),
  )[0];
}

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}

const rowGrid =
  'grid min-w-[60rem] grid-cols-[minmax(10rem,1.4fr)_8rem_4rem_minmax(9rem,1fr)_6rem_minmax(9rem,1fr)_5rem] items-center gap-4 px-4';

const statusStyles: Record<ProjectStatus, string> = {
  Anteproyecto: 'bg-estado-anteproyecto text-estado-anteproyecto-fg',
  Completado: 'bg-estado-completado text-estado-completado-fg',
  'En obra': 'bg-estado-en-obra text-estado-en-obra-fg',
};

export default async function AdminDashboard() {
  const projects = await getAdminProjects();
  const totalImages = projects.reduce((sum, p) => sum + p.images.length, 0);
  const totalPublications = projects.reduce(
    (sum, p) => sum + (p.publications?.length ?? 0),
    0,
  );
  const latest = getLatestProject(projects);
  const latestDate = formatDate(latest?.updatedAt);

  const card = 'border border-neutral-200 bg-white p-4';
  const value = 'font-heading text-2xl font-bold sm:text-3xl tracking-tight text-neutral-900';
  const label = 'mt-1.5 font-mono text-[11px] uppercase tracking-widest text-neutral-500';
  const icon = 'mb-3 text-blueprint';

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold sm:text-4xl tracking-tight text-neutral-900">
        Dashboard
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 xl:grid-cols-4">
        <div className={card}>
          <FolderKanban size={20} className={icon} />
          <p className={value}>{projects.length}</p>
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
          <p className={`${value} truncate`}>{latest ? latest.title : '—'}</p>
          <p className={label}>
            {latest ? `Última edición${latestDate ? ` · ${latestDate}` : ''}` : 'Sin ediciones aún'}
          </p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900">
          Proyectos
        </h2>

        {projects.length === 0 ? (
          <div className="mt-6 border border-neutral-200 bg-white px-4 py-12 text-center">
            <p className="font-medium text-neutral-900">Sin proyectos aún</p>
            <p className="mt-1 text-sm text-neutral-500">
              Creá el primero desde{' '}
              <Link href="/admin" className="text-blueprint hover:underline">
                Proyectos
              </Link>
              . Si ya cargaste proyectos y no aparecen, revisá la conexión con la base de datos.
            </p>
          </div>
        ) : (
          <>
          <div className="mt-6 divide-y divide-neutral-200 border border-neutral-200 bg-white xl:hidden">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="flex flex-col gap-2 p-4 text-sm text-neutral-900 transition-colors hover:bg-neutral-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0 break-words font-medium">{project.title}</span>
                  <span
                    className={`inline-block shrink-0 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider ${statusStyles[project.status]}`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="text-neutral-600">
                  {[project.location, project.year, project.area && `${project.area} m²`]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </div>
                <div className="text-xs text-neutral-500">
                  {project.images.length} imágenes
                  {project.collaborators ? ` · ${project.collaborators}` : ''}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 hidden overflow-x-auto border border-neutral-200 bg-white xl:block">
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
              {projects.map((project) => (
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
                  <div className="text-neutral-600">{project.year || '—'}</div>
                  <div className="truncate text-neutral-600">{project.location || '—'}</div>
                  <div className="text-neutral-600">{project.area ? `${project.area} m²` : '—'}</div>
                  <div className="truncate text-neutral-600">{project.collaborators ?? '—'}</div>
                  <div className="text-neutral-600">{project.images.length}</div>
                </Link>
              ))}
            </div>
          </div>
          </>
        )}
      </section>
    </div>
  );
}
