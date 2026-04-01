"use server";
import prisma from "@/lib/db";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function login(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password required" };
  }

  // Find user
  let user = await prisma.user.findUnique({ where: { username } });
  console.log(user);
  // For ease of testing, creating user on the fly if not exists (auto-register)
  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });
  } else {
    if (user.password == password) {

    }
    else {
      return { error: "Invalid password" };
      // const isValid = await bcrypt.compare(password, user.password);
      // if (!isValid) {

      // }
    }
  }

  const sessionData = { userId: user.id, username: user.username };
  const token = await encrypt(sessionData);

  // Use await for cookies() as per newer Next.js patterns, though cookies() in Next 15 requires awaiting
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  });

  redirect("/projects");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}
