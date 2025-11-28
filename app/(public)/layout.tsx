import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-indigo-700">Bienvenido a OTIC Manager</h1>
        <p className="text-gray-600 text-center">Gestiona tus fichas, usuarios y equipos de manera eficiente.</p>
        <Link
          href="/auth/login"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
        >
          Iniciar sesión
        </Link>
        {children}
      </div>
    </div>
  );
}
