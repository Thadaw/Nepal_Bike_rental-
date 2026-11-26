
import { prisma } from "./src/config/prisma";

async function main() {
  try {
    const result = await prisma.$queryRaw`
      SELECT current_database(), current_user
    `;

    console.log("Database connection successful!");
    console.log(result);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
