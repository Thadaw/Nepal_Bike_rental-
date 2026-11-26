import "dotenv/config";
import bcrypt from "bcrypt";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { prisma } from "../config/prisma";

const terminal = createInterface({ input: stdin, output: stdout });

async function main() {
  try {
    const name = (await terminal.question("Admin name: ")).trim();
    const email = (await terminal.question("Admin email: "))
      .trim()
      .toLowerCase();

    const password = await terminal.question("Admin password: ");

    if (!name || !email || password.length < 8) {
      throw new Error(
        "Name and email are required. Password must contain at least 8 characters."
      );
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      throw new Error("An admin with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    console.log("\nAdmin account created successfully!");
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
  } catch (error) {
    console.error("\nAdmin creation failed:", error);
    process.exitCode = 1;
  } finally {
    terminal.close();
    await prisma.$disconnect();
  }
}

main();
