import { Toaster } from 'sonner';
import Sidebar from '@/components/admin/Sidebar';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile, error } = user
    ? await supabase.from('perfiles').select('nombre, apellido, rol').eq('id', user.id).maybeSingle()
    : { data: null, error: null };
  if (error) console.error('[AdminLayout] No se pudo leer el perfil:', error);
  // Sin fila de perfil (o si falla la consulta) se cae al correo de Auth.
  const userName = profile ? `${profile.nombre} ${profile.apellido}`.trim() : user?.email || 'Admin';
  const userRole = profile?.rol || 'Administrador';

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar userName={userName} userRole={userRole} />
      <main className="h-dvh min-w-0 flex-1 overflow-y-auto bg-gray-50 px-4 pb-8 pt-20 sm:px-6 lg:p-12">
        {children}
      </main>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
