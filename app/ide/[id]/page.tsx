import IDE from "../../components/IDE";
import prisma from "@/lib/db";
import { getSession } from "../../actions/project";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function IDEPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  let project = null;
  try {
    // Await params in Next.js 15
    const resolvedParams = await params;
    project = await prisma.project.findUnique({
      where: { id: resolvedParams.id },
    });
  } catch (e) {}

  if (!project || project.userId !== session.userId) {
    return (
      <div className="h-screen flex items-center justify-center text-white bg-gray-900">
        <h1>Project not found or unauthorized</h1>
      </div>
    );
  }

  // Pass project info to Client Component
  return <IDE projectId={project.id} projectName={project.name} />;
}
