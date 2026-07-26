import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@store.com",
    },
    update: {},
    create: {
      name: "المدير",
      email: "admin@store.com",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log("✅ Admin created successfully.");
  console.log({
    email: admin.email,
    role: admin.role,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });