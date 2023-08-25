import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
console.log(
  '🚀 ~ file: database.module.ts:20 ~ entities:',
  join(__dirname + '/../modules/**/entities/*.entity.{ts,js}'),
);

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('TYPEORM_HOST'),
          port: +configService.get('TYPEORM_PORT'),
          username: configService.get('TYPEORM_USERNAME'),
          password: configService.get('TYPEORM_PASSWORD'),
          database: configService.get('TYPEORM_DATABASE'),
          entities: [
            join(__dirname + '/../modules/**/entities/*.entity.{ts,js}'),
          ],
          autoLoadEntities: true,
          synchronize: true,
          retryAttempts: 2,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
