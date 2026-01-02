import { Global, Module } from '@nestjs/common';
import { ShoppingListsService } from './shopping-lists.service.js';

@Global()
@Module({
  providers: [ShoppingListsService],
  exports: [ShoppingListsService],
})
export class ShoppingListsModule {}
