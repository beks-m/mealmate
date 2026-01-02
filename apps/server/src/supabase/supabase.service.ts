import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Use a simple type for flexibility during development
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDatabase = any;

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient<AnyDatabase> | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!url || !key) {
      console.warn('Supabase credentials not configured. Database features will be unavailable.');
      return;
    }

    this.client = createClient<AnyDatabase>(url, key);
  }

  getClient(): SupabaseClient<AnyDatabase> {
    if (!this.client) {
      throw new Error('Supabase client not initialized. Check your environment variables.');
    }
    return this.client;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }
}
