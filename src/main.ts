import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = 3001;
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Data Clean - Van Rossum')
    .setDescription(
      'A system to manage data files.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath = 'api/swagger';

  SwaggerModule.setup(swaggerPath, app, document);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger available on: http://localhost:${port}/${swaggerPath}`);
  
}
bootstrap();
