import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filters and interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // CORS
  app.enableCors();

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Crypto App API')
    .setDescription(`
## API de Crypto App

Esta API permite:
- 🔐 **Autenticación** - Registro e inicio de sesión con JWT
- 💰 **Wallet** - Gestión de balance, depósitos, transferencias y retiros
- 🤖 **Agentes IA** - Análisis financiero con LangChain
- 💎 **Crypto** - Transferencias USDC on-chain en Polygon

### Autenticación
Usa el endpoint \`/auth/login\` para obtener un token JWT.
Luego incluye el token en el header: \`Authorization: Bearer <token>\`
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Endpoints de autenticación')
    .addTag('Wallet', 'Gestión de balance y transferencias')
    .addTag('Agents', 'Agentes de IA para análisis financiero')
    .addTag('Crypto', 'Operaciones on-chain USDC/Polygon')
    .addTag('Health', 'Estado del servicio')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Crypto App API Docs',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Crypto App running on http://localhost:${port}`);
  logger.log(`📚 API Docs available at http://localhost:${port}/api/docs`);
}

void bootstrap();


