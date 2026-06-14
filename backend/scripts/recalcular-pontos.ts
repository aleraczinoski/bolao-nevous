import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { calculatePoints } from '../src/predictions/points';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const partidas = await prisma.match.findMany({
    where: {
      status: 'FINISHED',
      homeScore: { not: null },
      awayScore: { not: null },
    },
    include: { predictions: true },
  });

  console.log(`Recalculando pontos de ${partidas.length} partidas finalizadas...`);

  let totalPalpites = 0;

  for (const partida of partidas) {
    const updates = partida.predictions.map((p) =>
      prisma.prediction.update({
        where: { id: p.id },
        data: {
          points: calculatePoints(
            partida.homeScore!,
            partida.awayScore!,
            p.homeScore,
            p.awayScore,
          ),
        },
      }),
    );

    await prisma.$transaction(updates);
    totalPalpites += updates.length;
    console.log(
      `  ${partida.homeScore}-${partida.awayScore} | ${updates.length} palpite(s) atualizados`,
    );
  }

  console.log(`\nConcluído! ${totalPalpites} palpites recalculados.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
