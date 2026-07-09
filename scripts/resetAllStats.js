const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting reset of all user stats, achievements, and goals...");
    
    // Delete related records
    await prisma.userAchievement.deleteMany({});
    await prisma.goal.deleteMany({});
    await prisma.xpHistory.deleteMany({});
    await prisma.topicProgress.deleteMany({});
    await prisma.studySession.deleteMany({});
    await prisma.questionAttempt.deleteMany({});
    await prisma.examAttempt.deleteMany({});
    await prisma.flashcardReview.deleteMany({});
    
    // Reset totalXp on all users
    await prisma.user.updateMany({
      data: {
        totalXp: 0,
      }
    });

    console.log("Successfully reset all stats!");
  } catch (error) {
    console.error("Failed to reset stats:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();