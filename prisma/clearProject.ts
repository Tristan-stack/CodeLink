import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearProjects() {
  try {
    // Delete related Commit records
    await prisma.commit.deleteMany({});
    console.log('All commits have been deleted.');

    // Delete related UserToProject records
    await prisma.userToProject.deleteMany({});
    console.log('All user-project associations have been deleted.');

    // Delete all Project records
    await prisma.project.deleteMany({});
    console.log('All projects have been deleted.');
  } catch (error) {
    console.error('Error clearing projects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearProjects();