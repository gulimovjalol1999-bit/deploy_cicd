import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet({ contentSecurityPolicy: false, hsts: false }));

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Swagger ────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Stadium Booking Management API')
    .setDescription(
      'Production-ready backend for Football Stadium (Gazon) Booking & Management Platform. ' +
        'Admins create and manage bookings on behalf of customers. ' +
        'Full audit trail, revenue analytics, and fraud prevention.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'Authorization' },
      'access-token',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'RefreshToken' },
      'refresh-token',
    )
    .addTag('Auth', 'Login, logout, refresh token')
    .addTag('Bookings', 'Create and manage bookings')
    .addTag('Payments', 'Payment tracking per booking')
    .addTag('Pricing', 'Hourly price management with versioning')
    .addTag('Analytics', 'Revenue, usage, and admin performance analytics')
    .addTag('Audit Logs', 'Immutable action history (SUPER_ADMIN)')
    .addTag('Dashboard', 'System overview widget data')
    .addTag('Admin Management', 'Admin account management (SUPER_ADMIN)')
    .addTag('Users', 'User CRUD (SUPER_ADMIN)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
    },
  });

  // Simple health check — used by Docker/load balancer
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req: any, res: any) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`\n🏟  Stadium API running on  http://localhost:${port}/api/v1`);
  console.log(`📖  Swagger docs at          http://localhost:${port}/api/docs\n`);
}

void bootstrap(); 
