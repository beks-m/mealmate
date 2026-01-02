import { Global, Module } from '@nestjs/common';
import { RecipesService } from './recipes.service.js';

@Global()
@Module({
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
