import prisma from "@/lib/db";
import { getSession, createProject } from "../actions/project";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "../actions/auth";

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let projects: any[] = [];
  try {
    projects = await prisma.project.findMany({
      where: { userId: session.userId as string },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome, {session.username}</h1>
          <form action={logout}>
            <button className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-800 transition">
              Logout
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Project Form */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Create New Project</h2>
            <form action={async (formData: FormData) => {
              "use server";
              await createProject(formData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Project Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded font-medium transition"
              >
                Create & Open IDE
              </button>
            </form>
          </div>

          {/* List Projects */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-[400px] overflow-auto">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Your Projects</h2>
            {projects.length === 0 ? (
              <p className="text-gray-400">No projects yet. Create one!</p>
            ) : (
              <ul className="space-y-3">
                {projects.map((p: any) => (
                  <li key={p.id}>
                    <Link
                      href={`/ide/${p.id}`}
                      className="block p-4 border border-gray-600 rounded hover:border-blue-500 hover:bg-gray-750 transition"
                    >
                      <h3 className="font-semibold text-lg">{p.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Created: {p.createdAt.toLocaleDateString()}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
