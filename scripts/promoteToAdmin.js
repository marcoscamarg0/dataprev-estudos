const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error("Please provide an email address");
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" }
    });
    console.log(`Successfully promoted ${user.name} (${user.email}) to ADMIN role.`);
  } catch (error) {
    console.error("Failed to promote user. Are you sure this email exists?", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();