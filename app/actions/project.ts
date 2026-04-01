"use server";
import prisma from "@/lib/db";
import { encrypt, decrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return { error: "Project name is required" };

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return { error: "Not authenticated" };

  try {
    const payload = await decrypt(token);
    const userId = payload.userId as string;

    const project = await prisma.project.create({
      data: {
        name,
        userId,
      },
    });
    
    // We should create the directory internally or when first needed
    // The FS api will handle this

    redirect(`/ide/${project.id}`);
  } catch (error) {
    console.error("Failed to create project", error);
    return { error: "Failed to create project. Database running?" };
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    return await decrypt(token);
  } catch {
    return null;
  }
}
