'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, PlusCircle, ArrowLeft, ChevronDown } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

interface NavSection {
  label: string;
  links: NavLink[];
}

const sections: NavSection[] = [
  {
    label: 'Dashboard',
    links: [{ href: '/admin/dashboard', label: 'Métricas', icon: LayoutDashboard }],
  },
  {
    label: 'Proyectos',
    links: [
      { href: '/admin', label: 'Todos los proyectos', icon: FolderKanban },
      { href: '/admin/projects/new', label: 'Nuevo proyecto', icon: PlusCircle },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-neutral-900/10 bg-white">
      <div className="px-6 py-8">
        <span className="block font-heading text-lg font-bold tracking-tight text-neutral-900">
          STUDIO ACAA
        </span>
        <span className="mt-1 block font-mono text-[11px] text-neutral-500">
          Panel de administración
        </span>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-8 px-4">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-2 font-mono text-xs font-medium uppercase tracking-widest text-neutral-500">
              {section.label}
            </p>
            <div className="flex flex-col gap-1">
              {section.links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 rounded-lg border-l-2 px-2 py-2 text-sm transition-colors ${
                      isActive
                        ? 'border-blueprint bg-blueprint-soft font-medium text-blueprint'
                        : 'border-transparent text-neutral-500 hover:text-blueprint'
                    }`}
                  >
                    <Icon size={20} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-neutral-900/10 px-4 py-4">
        <Link
          href="/"
          className="mb-3 flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-700"
        >
          <ArrowLeft size={18} /> Ver sitio
        </Link>

        <div className="flex items-center gap-2 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white">
            A
          </div>
          <div className="flex-1 text-sm font-medium text-neutral-900">Alberto — Admin</div>
          <ChevronDown size={16} className="text-neutral-500" />
        </div>
      </div>
    </aside>
  );
}
