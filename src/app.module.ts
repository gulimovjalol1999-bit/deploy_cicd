import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import databaseConfig from "./config/database.config";
import jwtConfig from "./config/jwt.config";
import { AdminModule } from "./modules/admin/admin.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { PricingModule } from "./modules/pricing/pricing.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [databaseConfig, jwtConfig],
    }),

    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("database.host"),
        port: config.get<number>("database.port"),
        username: config.get<string>("database.username"),
        password: config.get<string>("database.password"),
        database: config.get<string>("database.name"),
        entities: [__dirname + "/modules/**/entities/*.entity{.ts,.js}"],
        synchronize: config.get("NODE_ENV") !== "production",
        logging: config.get("NODE_ENV") === "development",
        autoLoadEntities: true,
      }),
    }),

    AuthModule,
    UsersModule,
    BookingsModule,
    PricingModule,
    AuditModule,
    AnalyticsModule,
    AdminModule,
    PaymentsModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
