
import "dotenv/config";
import app from "./app";
import { prisma } from "./config/prisma";

const PORT = Number(process.env.PORT) || 4000;

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();

    console.log("PostgreSQL connected successfully");

    app.listen(PORT, () => {
      console.log(`Nepal Bike Rental API running on port ${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
