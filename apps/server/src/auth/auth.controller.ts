import { Controller, Get } from '@nestjs/common';

/**
 * OAuth 2.1 protected resource metadata endpoint
 * Reference: RFC 9470 and OpenAI Apps SDK docs
 */
@Controller('.well-known')
export class AuthController {
  @Get('oauth-protected-resource')
  getProtectedResourceMetadata() {
    // Return metadata about this protected resource
    // ChatGPT uses this to discover the authorization server
    const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
    const authServer = process.env.OAUTH_ISSUER || baseUrl;

    return {
      resource: `${baseUrl}/mcp`,
      authorization_servers: [authServer],
      scopes_supported: ['read', 'write', 'profile'],
      bearer_methods_supported: ['header'],
      resource_documentation: 'https://github.com/mealmate/docs',
    };
  }
}

/**
 * Simple auth guard for extracting user from token
 * For MVP, we use anonymous users tied to session
 * Full OAuth implementation can be added later
 */
export function extractUserFromHeaders(headers: Headers): string | null {
  const auth = headers.get?.('authorization') || (headers as unknown as Record<string, string>)['authorization'];

  if (!auth) {
    return null;
  }

  // For MVP, just extract session ID or return anonymous
  // Real implementation would verify JWT token
  if (auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    // In production, verify token signature using JWKS
    // For now, just use the token as user identifier
    return token || 'anonymous';
  }

  return 'anonymous';
}
