'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, FolderKanban, PlusCircle, ArrowLeft, LogOut, Menu, X } from 'lucide-react';

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

export default function Sidebar({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    try {
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      router.replace('/login');
      router.refresh();
    } catch (error) {
      console.error('[signOut]', error);
      toast.error('No se pudo cerrar la sesión. Intentá de nuevo.');
      setSigningOut(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-20 flex h-14 items-center gap-3 border-b border-neutral-900/10 bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="-ml-2 flex h-10 w-10 items-center justify-center text-neutral-900"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          <Menu size={22} />
        </button>
        <span className="font-heading text-base font-bold tracking-tight text-neutral-900">STUDIO ACAA</span>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-neutral-900/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

    <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r border-neutral-900/10 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-start justify-between px-6 py-8">
        <div>
          <span className="block font-heading text-lg font-bold tracking-tight text-neutral-900">
            STUDIO ACAA
          </span>
          <span className="mt-1 block font-mono text-[11px] text-neutral-500">
            Panel de administración
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="-mr-2 -mt-2 flex h-10 w-10 items-center justify-center text-neutral-500 lg:hidden"
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>
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
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 rounded-lg border-l-2 px-2 py-2.5 text-sm transition-colors ${
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
          onClick={() => setOpen(false)}
          className="mb-3 flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-700"
        >
          <ArrowLeft size={18} /> Ver sitio
        </Link>

        <div className="flex items-center gap-2 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium uppercase text-white">
            {userName.charAt(0) || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-neutral-900" title={userName}>{userName}</div>
            <div className="font-mono text-[11px] capitalize text-neutral-500">{userRole}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#b45454] px-3 font-mono text-xs uppercase tracking-widest text-[#b45454] transition-colors hover:bg-[#b45454] hover:text-white disabled:opacity-50"
        >
          <LogOut size={16} /> {signingOut ? 'Cerrando…' : 'Cerrar sesión'}
        </button>
      </div>
    </aside>
    </>
  );
}
