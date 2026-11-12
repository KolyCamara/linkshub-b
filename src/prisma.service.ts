import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    const delays = [250, 500, 1000];

    for (let attempt = 0; attempt < delays.length; attempt += 1) {
      try {
        await this.$connect();
        return;
      } catch (error) {
        if (attempt === delays.length - 1) {
          this.logger.error(
            'PostgreSQL est indisponible au démarrage. Les requêtes concernées retourneront 503.',
          );
          return;
        }

        this.logger.warn(
          `Connexion PostgreSQL indisponible, nouvelle tentative ${attempt + 2}/${delays.length}.`,
        );
        await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
        void error;
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
