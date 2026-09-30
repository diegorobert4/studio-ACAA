import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="h-screen flex-1 overflow-y-auto bg-gray-50 p-12">{children}</main>
    </div>
  );
}
