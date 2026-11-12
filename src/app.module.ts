import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LinksModule } from './links/links.module';
import { PrismaModule } from './prisma.module';
import { HealthController } from './health.controller';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { CollectionsModule } from './collections/collections.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    LinksModule,
    CategoriesModule,
    CollectionsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
