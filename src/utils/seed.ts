import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Pre-application alanlarını seed'leyelim
  const preApplicationFieldsData = [
    { section: "contact", step: 1, defaultData: {} },
    { section: "incident", step: 2, defaultData: {} },
    { section: "passport", step: 3, defaultData: {} },
    { section: "employment", step: 4, defaultData: {} },
    { section: "recognition", step: 5, defaultData: {} },
    { section: "payment", step: 6, defaultData: {} },
  ];

  for (const field of preApplicationFieldsData) {
    await prisma.preApplicationField.create({
      data: field,
    });
  }

  // Application alanlarını seed'leyelim
  const applicationFieldsData = [
    { section: "marital", step: 1, defaultData: {} },
    { section: "employment", step: 2, defaultData: {} },
    { section: "workConditions", step: 3, defaultData: {} },
    { section: "postEmployment", step: 4, defaultData: {} },
    { section: "evidenceWitness", step: 5, defaultData: {} },
  ];

  for (const field of applicationFieldsData) {
    await prisma.applicationField.create({
      data: field,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
