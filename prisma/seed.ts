import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  'Développement web',
  'Intelligence artificielle',
  'Data Science',
  'Documentation',
  'Formations',
  'Outils en ligne',
  'Productivité',
  'Design',
];

async function main() {
  const categoryRecords = new Map<string, { id: string }>();
  for (const name of categories) {
    const category =
      (await prisma.category.findFirst({ where: { name, userId: null } })) ??
      (await prisma.category.create({ data: { name } }));
    categoryRecords.set(name, category);
  }

  const links = [
    ['Python Documentation', 'https://docs.python.org/3/', 'Documentation', 'Documentation'],
    ['MDN Web Docs', 'https://developer.mozilla.org/fr/', 'Documentation', 'Documentation'],
    ['GitHub', 'https://github.com/', 'Développement web', 'Repository'],
  ] as const;

  for (const [name, url, categoryName, resourceType] of links) {
    const category = categoryRecords.get(categoryName);
    if (!category) continue;
    await prisma.link.upsert({
      where: { id: `${category.id}-${name.toLowerCase().replaceAll(' ', '-')}` },
      update: {},
      create: {
        id: `${category.id}-${name.toLowerCase().replaceAll(' ', '-')}`,
        name,
        url,
        categoryId: category.id,
        resourceType,
      },
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
