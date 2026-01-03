import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Tool schemas
const SaveRecipeSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  ingredients: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    unit: z.string(),
    notes: z.string().optional(),
  })),
  instructions: z.array(z.string()),
  nutrition: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
    fiber: z.number().optional(),
    sugar: z.number().optional(),
    sodium: z.number().optional(),
  }),
  servings: z.number(),
  prep_time_minutes: z.number(),
  cook_time_minutes: z.number(),
  category: z.string(),
  tags: z.array(z.string()).optional(),
});

const GetRecipesSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().optional(),
});

// In-memory storage
const recipes: any[] = [];
const mealPlans: any[] = [];

// Widget HTML (minimal)
const WIDGET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, sans-serif; padding: 16px; margin: 0; }
    .card { background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 8px 0; }
    h2 { margin: 0 0 8px 0; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    const output = window.openai?.toolOutput || {};
    const root = document.getElementById('root');
    root.innerHTML = '<div class="card"><h2>MealMate</h2><pre>' + JSON.stringify(output, null, 2) + '</pre></div>';
  </script>
</body>
</html>
`.trim();

const TEMPLATE_URI = 'ui://widget/mealmate.html';

function widgetMeta() {
  return {
    'openai/outputTemplate': TEMPLATE_URI,
    'openai/toolInvocation/invoking': 'Loading...',
    'openai/toolInvocation/invoked': 'Ready',
    'openai/widgetAccessible': true,
  } as const;
}

const tools = [
  {
    name: 'save_recipe',
    title: 'Save Recipe',
    description: "Save a recipe to the user's collection.",
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Recipe title' },
        description: { type: 'string', description: 'Brief description' },
        ingredients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              amount: { type: 'number' },
              unit: { type: 'string' },
            },
            required: ['name', 'amount', 'unit'],
          },
        },
        instructions: { type: 'array', items: { type: 'string' } },
        nutrition: {
          type: 'object',
          properties: {
            calories: { type: 'number' },
            protein: { type: 'number' },
            carbs: { type: 'number' },
            fat: { type: 'number' },
          },
          required: ['calories', 'protein', 'carbs', 'fat'],
        },
        servings: { type: 'number' },
        prep_time_minutes: { type: 'number' },
        cook_time_minutes: { type: 'number' },
        category: { type: 'string' },
      },
      required: ['title', 'ingredients', 'instructions', 'nutrition', 'servings', 'prep_time_minutes', 'cook_time_minutes', 'category'],
    },
    _meta: widgetMeta(),
    annotations: {
      destructiveHint: false,
      openWorldHint: false,
      readOnlyHint: false,
    },
  },
  {
    name: 'get_recipes',
    title: 'Get Recipes',
    description: 'Get saved recipes.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string' },
        search: { type: 'string' },
        limit: { type: 'number' },
      },
    },
    _meta: widgetMeta(),
    annotations: {
      destructiveHint: false,
      openWorldHint: false,
      readOnlyHint: true,
    },
  },
];

const resources = [
  {
    uri: TEMPLATE_URI,
    name: 'MealMate Widget',
    description: 'MealMate widget markup',
    mimeType: 'text/html+skybridge',
    _meta: widgetMeta(),
  },
];

const resourceTemplates = [
  {
    uriTemplate: TEMPLATE_URI,
    name: 'MealMate Widget',
    description: 'MealMate widget markup',
    mimeType: 'text/html+skybridge',
    _meta: widgetMeta(),
  },
];

function createMcpServer(): Server {
  const server = new Server(
    { name: 'mealmate', version: '0.1.0' },
    { capabilities: { resources: {}, tools: {} } }
  );

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({ resources }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri !== TEMPLATE_URI) {
      throw new Error(`Unknown resource: ${request.params.uri}`);
    }
    return {
      contents: [{
        uri: TEMPLATE_URI,
        mimeType: 'text/html+skybridge',
        text: WIDGET_HTML,
        _meta: widgetMeta(),
      }],
    };
  });

  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({ resourceTemplates }));

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'save_recipe') {
      const input = SaveRecipeSchema.parse(args ?? {});
      const recipe = {
        id: crypto.randomUUID(),
        ...input,
        created_at: new Date().toISOString(),
      };
      recipes.push(recipe);
      return {
        content: [{ type: 'text', text: `Recipe "${recipe.title}" saved!` }],
        structuredContent: { recipe_id: recipe.id, title: recipe.title },
        _meta: widgetMeta(),
      };
    }

    if (name === 'get_recipes') {
      const input = GetRecipesSchema.parse(args ?? {});
      let result = [...recipes];
      if (input.category) {
        result = result.filter(r => r.category === input.category);
      }
      if (input.search) {
        const s = input.search.toLowerCase();
        result = result.filter(r => r.title.toLowerCase().includes(s));
      }
      if (input.limit) {
        result = result.slice(0, input.limit);
      }
      return {
        content: [{ type: 'text', text: `Found ${result.length} recipes.` }],
        structuredContent: { recipes: result },
        _meta: widgetMeta(),
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  return server;
}

type SessionRecord = { server: Server; transport: SSEServerTransport };
const sessions = new Map<string, SessionRecord>();

const ssePath = '/mcp';
const postPath = '/mcp/messages';

async function handleSseRequest(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const server = createMcpServer();
  const transport = new SSEServerTransport(postPath, res);
  const sessionId = transport.sessionId;

  sessions.set(sessionId, { server, transport });

  transport.onclose = async () => {
    sessions.delete(sessionId);
    await server.close();
  };

  transport.onerror = (error) => {
    console.error('SSE transport error', error);
  };

  try {
    await server.connect(transport);
  } catch (error) {
    sessions.delete(sessionId);
    console.error('Failed to start SSE session', error);
    if (!res.headersSent) {
      res.writeHead(500).end('Failed to establish SSE connection');
    }
  }
}

async function handlePostMessage(req: IncomingMessage, res: ServerResponse, url: URL) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    res.writeHead(400).end('Missing sessionId query parameter');
    return;
  }

  const session = sessions.get(sessionId);

  if (!session) {
    res.writeHead(404).end('Unknown session');
    return;
  }

  try {
    await session.transport.handlePostMessage(req, res);
  } catch (error) {
    console.error('Failed to process message', error);
    if (!res.headersSent) {
      res.writeHead(500).end('Failed to process message');
    }
  }
}

const port = Number(process.env.PORT ?? 8000);

const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (!req.url) {
    res.writeHead(400).end('Missing URL');
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'OPTIONS' && (url.pathname === ssePath || url.pathname === postPath)) {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname === ssePath) {
    await handleSseRequest(res);
    return;
  }

  if (req.method === 'POST' && url.pathname === postPath) {
    await handlePostMessage(req, res, url);
    return;
  }

  res.writeHead(404).end('Not Found');
});

httpServer.on('clientError', (err: Error, socket) => {
  console.error('HTTP client error', err);
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

httpServer.listen(port, () => {
  console.log(`MealMate MCP server listening on http://localhost:${port}`);
  console.log(`  SSE stream: GET http://localhost:${port}${ssePath}`);
  console.log(`  Message post endpoint: POST http://localhost:${port}${postPath}?sessionId=...`);
});
