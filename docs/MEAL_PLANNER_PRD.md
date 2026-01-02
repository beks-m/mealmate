# MealMate - AI-Powered Meal Planning Mini App

## Product Requirements Document (PRD) + Technical Specification

**Version:** 2.0
**Date:** January 2026
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [User Stories & Features](#3-user-stories--features)
4. [Technical Architecture](#4-technical-architecture)
   - 4.1 High-Level Architecture
   - 4.2 Typical User Flows
   - 4.3 Technology Stack
   - 4.4 OpenAI Apps SDK UI
   - 4.5 ChatGPT UI Guidelines
   - 4.6 Project Structure
5. [Data Models](#5-data-models)
6. [MCP Server Design](#6-mcp-server-design)
   - 6.1 MCP Tools
   - 6.2 MCP Resources
   - 6.3 Tool Metadata & Annotations
   - 6.4 Response Payload Structure
   - 6.5 Content Security Policy (CSP)
   - 6.6 File Handling
   - 6.7 Localization & Client Hints
7. [Authentication](#7-authentication)
   - 7.1 OAuth 2.1 Flow
   - 7.2 Protected Resource Metadata
   - 7.3 Token Verification
   - 7.4 Security Schemes for Tools
8. [State Management](#8-state-management)
   - 8.1 Three-Part State Architecture
   - 8.2 Widget State APIs
   - 8.3 useWidgetState Hook
   - 8.4 Server-Driven Data Flow
9. [Frontend Design](#9-frontend-design)
   - 9.1 Widget Views
   - 9.2 Display Modes
   - 9.3 Widget Runtime APIs
   - 9.4 Component Hierarchy
10. [Internationalization (i18n)](#10-internationalization-i18n)
11. [Build vs Modify Decision](#11-build-vs-modify-decision)
12. [Implementation Roadmap](#12-implementation-roadmap)
13. [Resolved & Open Questions](#13-resolved--open-questions)
14. [Appendices](#appendix-a-environment-variables)
    - A: Environment Variables
    - B: Key Dependencies
    - C: Useful Commands

---

## 1. Executive Summary

**MealMate** is a ChatGPT Mini App that enables users to plan meals, track nutrition (calories, macros), and create shopping lists. The app provides **persistence and UI** while **ChatGPT handles all AI generation** directly in the conversation.

### Key Architecture Principle

```
┌─────────────────────────────────────────────────────────────┐
│  USER: "Generate a high-protein breakfast under 400 cal"   │
│                           ↓                                 │
│  CHATGPT: Generates recipe with ingredients & nutrition     │
│                           ↓                                 │
│  CHATGPT: Calls save_recipe tool → App stores data          │
│                           ↓                                 │
│  APP WIDGET: Displays saved recipe in rich UI               │
└─────────────────────────────────────────────────────────────┘
```

**The app does NOT call any external AI APIs.** All intelligence comes from ChatGPT. The app is purely:
- **Storage**: Supabase database for recipes, meal plans, shopping lists
- **UI**: React widgets for viewing and managing data
- **Tools**: MCP tools for ChatGPT to save/retrieve/modify data

### Key Differentiators

- **ChatGPT-Native**: User talks to ChatGPT, app just stores and displays results
- **Zero AI Costs**: No OpenAI/Anthropic API calls from the app
- **Family Support**: Plan meals for multiple household members with different dietary needs
- **Goal-Oriented**: ChatGPT generates plans based on user goals stored in app
- **Bilingual**: Full English and Russian support from day one
- **Persistent**: All data saved to Supabase for cross-session continuity

---

## 2. Product Vision

### Problem Statement

Users struggle to:
1. Plan consistent, healthy meals for the week
2. Calculate accurate nutrition information
3. Generate varied recipes that match their dietary goals
4. Create efficient shopping lists from meal plans
5. Coordinate meals for multiple family members

### Solution

A ChatGPT-integrated widget where:

**ChatGPT does:**
- Generate personalized recipes via natural language conversation
- Calculate calories and macronutrients for recipes
- Create weekly meal plans based on user goals
- Suggest meals based on dietary restrictions
- Generate shopping lists from meal plans

**The App does:**
- Store recipes, meal plans, and shopping lists in Supabase
- Display rich UI for viewing and managing data
- Track family members and their dietary profiles
- Provide MCP tools for ChatGPT to read/write data
- Support bilingual interface (EN/RU)

**The App does NOT:**
- Call OpenAI, Anthropic, or any AI APIs
- Generate recipes or meal plans itself
- Calculate nutrition (ChatGPT does this)

### Target Users

- Health-conscious individuals tracking nutrition
- Families planning weekly meals
- People following specific diets (keto, vegan, high-protein, etc.)
- Russian and English speaking users

---

## 3. User Stories & Features

### 3.1 Recipe Management

| ID | User Story | Priority |
|----|------------|----------|
| R1 | As a user, I can ask ChatGPT to generate a recipe based on ingredients I have | P0 |
| R2 | As a user, I can see the full recipe with ingredients, steps, and nutrition info | P0 |
| R3 | As a user, I can save a generated recipe to my personal collection | P0 |
| R4 | As a user, I can say "show my recipes" and see all my saved recipes in a widget | P0 |
| R5 | As a user, I can ask ChatGPT to find a specific saved recipe by name | P0 |
| R6 | As a user, I can edit a saved recipe (ingredients, portions, steps) via ChatGPT | P1 |
| R7 | As a user, I can delete recipes from my collection | P1 |
| R8 | As a user, I can search my saved recipes by name or ingredient | P1 |
| R9 | As a user, I can adjust serving size and see recalculated nutrition | P2 |
| R10 | As a user, I can mark recipes as favorites | P2 |

### 3.2 Meal Planning

| ID | User Story | Priority |
|----|------------|----------|
| M1 | As a user, I can say "show my meal plan" and see my current plan in a calendar widget | P0 |
| M2 | As a user, I can ask "what's for dinner tonight?" and get an answer from my plan | P0 |
| M3 | As a user, I can create a meal plan for 1-14 days | P0 |
| M4 | As a user, I can assign recipes to specific meals (breakfast, lunch, dinner, snacks) | P0 |
| M5 | As a user, I can ask ChatGPT to generate a full meal plan based on my goals | P0 |
| M6 | As a user, I can see daily/weekly nutrition totals for my meal plan | P0 |
| M7 | As a user, I can swap individual meals in a generated plan via ChatGPT | P1 |
| M8 | As a user, I can ask ChatGPT to replace a meal with something different | P1 |
| M9 | As a user, I can copy a meal plan to another week | P2 |
| M10 | As a user, I can set recurring meals (e.g., same breakfast daily) | P2 |

### 3.3 Family & Profiles

| ID | User Story | Priority |
|----|------------|----------|
| F1 | As a user, I can add family members with their own dietary profiles | P1 |
| F2 | As a user, I can set dietary restrictions per family member (allergies, preferences) | P1 |
| F3 | As a user, I can set calorie/macro goals per family member | P1 |
| F4 | As a user, I can generate a meal plan that accommodates all family members | P2 |
| F5 | As a user, I can see per-person nutrition breakdown | P2 |

### 3.4 Shopping List

| ID | User Story | Priority |
|----|------------|----------|
| S1 | As a user, I can say "show my shopping list" and see my current list in a widget | P0 |
| S2 | As a user, I can generate a shopping list from my meal plan | P0 |
| S3 | As a user, I can see ingredients grouped by category (produce, dairy, etc.) | P1 |
| S4 | As a user, I can check off items as I shop (in widget UI) | P1 |
| S5 | As a user, I can ask "what do I need to buy?" and get a summary | P1 |
| S6 | As a user, I can manually add items to the shopping list via ChatGPT | P2 |
| S7 | As a user, I can adjust quantities in the shopping list | P2 |

### 3.5 Goals & Tracking

| ID | User Story | Priority |
|----|------------|----------|
| G1 | As a user, I can set my dietary goal (weight loss, maintenance, muscle gain) | P0 |
| G2 | As a user, I can set custom daily calorie and macro targets | P0 |
| G3 | As a user, I can see how my meal plan compares to my goals | P1 |
| G4 | As a user, I can set dietary restrictions (vegetarian, gluten-free, etc.) | P1 |

---

## 4. Technical Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ChatGPT                                  │
│                                                                  │
│   User: "Create a 400 cal high-protein breakfast"               │
│                           │                                      │
│   ChatGPT (AI): Generates recipe with full details              │
│                           │                                      │
│   ChatGPT: Calls save_recipe MCP tool ─────────────────┐        │
│                                                         │        │
│  ┌─────────────────────────────────────────────────────┐│        │
│  │            MealMate Widget (UI Only)                ││        │
│  │  - Displays saved recipes                           ││        │
│  │  - Shows meal plan calendar                         ││        │
│  │  - Renders shopping lists                           ││        │
│  │  (React + TypeScript + Tailwind)                    ││        │
│  └─────────────────────────────────────────────────────┘│        │
└─────────────────────────────────────────────────────────│────────┘
                                                          │
                              MCP Protocol (SSE/HTTP)     │
                                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              MealMate MCP Server (Data Layer Only)              │
│                    (NestJS + TypeScript)                        │
│                                                                  │
│   NO AI CALLS - Only CRUD operations:                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Recipes  │  │  Meals   │  │ Shopping │  │  Users   │        │
│  │  CRUD    │  │  CRUD    │  │  CRUD    │  │  CRUD    │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Supabase Client
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Supabase                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Postgres │  │   Auth   │  │ Storage  │  │   RLS    │        │
│  │    DB    │  │          │  │ (images) │  │ Policies │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Typical User Flows

**Flow 1: Generate and Save Recipe**
```
1. User: "Give me a keto dinner recipe under 500 calories"
2. ChatGPT: Generates recipe (name, ingredients, steps, nutrition)
3. ChatGPT: "Would you like me to save this recipe?"
4. User: "Yes"
5. ChatGPT: Calls save_recipe tool with recipe data
6. App: Stores in Supabase, returns success
7. Widget: Displays saved recipe with rich UI
```

**Flow 2: Create Meal Plan**
```
1. User: "Create a meal plan for next week, I want to lose weight"
2. ChatGPT: Calls get_user_profile tool to get calorie goals
3. App: Returns user's target (e.g., 1800 cal/day)
4. ChatGPT: Generates 7-day meal plan in conversation
5. User: "Save this plan"
6. ChatGPT: Calls create_meal_plan + add_meal_to_plan tools
7. App: Stores all entries in Supabase
8. Widget: Displays calendar view with meals
```

**Flow 3: View My Recipes**
```
1. User: "Show me my saved recipes"
2. ChatGPT: Calls show_recipes tool
3. App: Returns list of saved recipes from Supabase
4. Widget: Displays recipe collection in carousel/grid
5. User can browse, click to see details, or ask ChatGPT about specific recipes
```

**Flow 4: View My Meal Plan**
```
1. User: "What's my meal plan for this week?"
2. ChatGPT: Calls show_meal_plan tool with current week dates
3. App: Returns meal plan entries with recipe details
4. Widget: Displays calendar view with meals
5. User: "What am I having for dinner on Wednesday?"
6. ChatGPT: Reads from already-fetched data and responds
```

### 4.3 Technology Stack

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| **Frontend** | React | 19.x | Already in use, modern features |
| | TypeScript | 5.9+ | Strict mode, type safety |
| | Vite | 7.x | Fast builds, already configured |
| | Tailwind CSS | 4.x | Utility-first, required by Apps SDK UI |
| | **@openai/apps-sdk-ui** | Latest | **Official OpenAI UI library** |
| | Framer Motion | 12.x | Animations |
| | react-intl | 7.x | Production i18n support |
| | Zustand | 5.x | Lightweight state management |
| | Zod | 4.x | Runtime validation |
| **Backend** | NestJS | 11.x | Enterprise-grade, TypeScript-native |
| | TypeScript | 5.9+ | Strict mode everywhere |
| | @nestjs/config | Latest | Environment management |
| | @supabase/supabase-js | 2.x | Database client |
| | @modelcontextprotocol/sdk | 0.5+ | MCP implementation |
| | class-validator | Latest | DTO validation |
| | class-transformer | Latest | Object transformation |
| **Database** | Supabase (PostgreSQL) | Latest | Managed, real-time, auth built-in |
| **Infrastructure** | ngrok (dev) | Latest | Local tunneling |
| | Vercel/Railway (prod) | - | Deployment |

### 4.4 OpenAI Apps SDK UI

We use the **official OpenAI UI library** for ChatGPT app consistency.

**Installation:**
```bash
npm install @openai/apps-sdk-ui
```

**Setup (main.css):**
```css
@import "tailwindcss";
@import "@openai/apps-sdk-ui/css";
@source "../node_modules/@openai/apps-sdk-ui";
```

**Provider Setup:**
```tsx
import { AppsSDKUIProvider } from '@openai/apps-sdk-ui';

function App() {
  return (
    <AppsSDKUIProvider>
      {/* App content */}
    </AppsSDKUIProvider>
  );
}
```

**Available Components:**
- `Button`, `ButtonLink` - Actions
- `TextLink` - Navigation
- `Badge` - Labels and tags
- Icons (Calendar, Invoice, Maps, Members, Phone, etc.)
- Design tokens for colors, typography, spacing

**Benefits:**
- Consistent with ChatGPT native UI
- Built on Radix primitives (accessible)
- Dark mode support
- Responsive utilities
- WCAG AA compliant

### 4.5 ChatGPT UI Guidelines

When building widgets for ChatGPT, follow these official guidelines:

#### Display Modes

| Mode | Use Case | Constraints |
|------|----------|-------------|
| **Inline** | Quick confirmations, recipe cards, shopping lists | Max 2 primary actions, no deep navigation |
| **Fullscreen** | Meal plan calendar, recipe editor | ChatGPT composer overlay remains visible |
| **PiP** | N/A for this app | For games/live sessions only |

#### Visual Design Rules

**DO:**
- Use `@openai/apps-sdk-ui` components and design tokens
- Use system color palettes for text, icons, structural elements
- Inherit platform-native fonts (SF Pro on iOS, Roboto on Android)
- Maintain WCAG AA contrast ratios
- Provide alt text for all images
- Keep inline cards simple with max 2 actions
- Use carousels with 3-8 items, 3 lines metadata max

**DON'T:**
- Include logo in responses (ChatGPT adds it automatically)
- Replicate ChatGPT features (no chat inputs in widget)
- Override background/text colors with brand colors
- Use nested scrolling in inline mode
- Add deep navigation in inline cards

### 4.6 Project Structure

```
mealmate/
├── apps/
│   ├── widget/                    # React frontend (ChatGPT widget)
│   │   ├── src/
│   │   │   ├── components/        # UI components
│   │   │   │   ├── recipes/
│   │   │   │   ├── meal-plan/
│   │   │   │   ├── shopping/
│   │   │   │   ├── family/
│   │   │   │   └── common/
│   │   │   ├── hooks/             # Custom hooks
│   │   │   ├── stores/            # Zustand stores
│   │   │   ├── i18n/              # Translations
│   │   │   │   ├── en.json
│   │   │   │   └── ru.json
│   │   │   ├── types/             # TypeScript types
│   │   │   ├── utils/             # Utilities
│   │   │   └── index.tsx          # Entry point
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── server/                    # NestJS MCP server
│       ├── src/
│       │   ├── mcp/               # MCP protocol handling
│       │   │   ├── mcp.module.ts
│       │   │   ├── mcp.controller.ts
│       │   │   ├── tools/         # MCP tool definitions
│       │   │   └── resources/     # MCP resource definitions
│       │   ├── recipes/           # Recipe domain
│       │   ├── meal-plans/        # Meal plan domain
│       │   ├── shopping/          # Shopping list domain
│       │   ├── users/             # User & family management
│       │   ├── database/          # Supabase integration
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/                    # Shared types & utilities
│       ├── src/
│       │   ├── types/             # Shared TypeScript types
│       │   ├── constants/         # Shared constants
│       │   └── utils/             # Shared utilities
│       └── package.json
│
├── supabase/
│   ├── migrations/                # Database migrations
│   └── seed.sql                   # Seed data
│
├── assets/                        # Built widget assets
├── package.json                   # Root package.json (pnpm workspace)
├── pnpm-workspace.yaml
└── tsconfig.base.json             # Base TypeScript config
```

---

## 5. Data Models

### 5.1 Database Schema (Supabase/PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    locale TEXT DEFAULT 'en' CHECK (locale IN ('en', 'ru')),
    dietary_goals JSONB,
    preferences JSONB DEFAULT '{"language": "en"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family members
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dietary_restrictions TEXT[] DEFAULT '{}',
    preferences JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    servings INTEGER NOT NULL DEFAULT 1,
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    ingredients JSONB NOT NULL DEFAULT '[]',
    instructions TEXT[] NOT NULL DEFAULT '{}',
    nutrition JSONB NOT NULL DEFAULT '{}',
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    source TEXT NOT NULL DEFAULT 'ai_generated',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal plans
CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days JSONB NOT NULL DEFAULT '[]',
    goals JSONB,
    family_member_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shopping lists
CREATE TABLE shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
```

---

## 6. MCP Server Design

### 6.1 MCP Tools

| Tool Name | Description | Returns Widget? |
|-----------|-------------|-----------------|
| `save_recipe` | Save a recipe to user's collection | Yes - Recipe detail |
| `get_recipes` | List user's saved recipes | No - Data only |
| `update_recipe` | Update existing recipe | Yes - Updated recipe |
| `delete_recipe` | Delete a recipe | No |
| `create_meal_plan` | Create a new meal plan | Yes - Meal plan view |
| `get_meal_plan` | Get meal plan with entries | No - Data only |
| `generate_shopping_list` | Generate list from meal plan | Yes - Shopping list |
| `toggle_shopping_item` | Check/uncheck item | No |
| `get_user_profile` | Get user profile & goals | No |
| `update_user_goals` | Update dietary goals | No |
| **UI Tools** | | |
| `show_dashboard` | Display main dashboard | Yes |
| `show_recipes` | Display recipe collection | Yes |
| `show_recipe_detail` | Display single recipe | Yes |
| `show_meal_plan` | Display meal plan calendar | Yes |
| `show_shopping_list` | Display shopping list | Yes |

### 6.2 MCP Resources

Widget UI bundles are registered as MCP resources with `mimeType: "text/html+skybridge"`:

```typescript
server.registerResource(
  "mealmate-dashboard",
  "ui://widget/mealmate-dashboard.html",
  {},
  async () => ({
    contents: [{
      uri: "ui://widget/mealmate-dashboard.html",
      mimeType: "text/html+skybridge",  // Required for ChatGPT widget rendering
      text: widgetHtmlContent,
      _meta: {
        "openai/widgetPrefersBorder": false,
        "openai/widgetDescription": "MealMate Dashboard - View recipes and meal plans"
      }
    }]
  })
);
```

**Resource Metadata Options:**

| Key | Type | Description |
|-----|------|-------------|
| `openai/widgetPrefersBorder` | boolean | Visual styling preference |
| `openai/widgetDomain` | string | Dedicated origin (enables fullscreen) |
| `openai/widgetDescription` | string | Descriptive text reducing redundant output |
| `openai/widgetCSP` | object | Content security policy rules |

### 6.3 Tool Metadata & Annotations

Each tool should include metadata for ChatGPT integration:

```typescript
{
  name: 'save_recipe',
  title: 'Save Recipe',
  description: 'Save a recipe to the user\'s collection',
  inputSchema: { ... },

  // Tool annotations
  annotations: {
    destructiveHint: false,      // Does it modify/delete data?
    openWorldHint: false,        // Does it access external services?
    readOnlyHint: false,         // Is it read-only?
  },

  // OpenAI-specific metadata
  _meta: {
    // Link to widget template
    "openai/outputTemplate": "ui://widget/recipe-detail.html",

    // Status messages shown during invocation
    "openai/toolInvocation/invoking": "Saving recipe...",
    "openai/toolInvocation/invoked": "Recipe saved!",

    // Enable widget to call this tool via window.openai.callTool
    "openai/widgetAccessible": true,

    // Hide from model but allow widget invocation (for internal tools)
    // "openai/visibility": "private",

    // For tools accepting file uploads
    // "openai/fileParams": ["imageToProcess"]
  }
}
```

### 6.4 Response Payload Structure

Every tool handler returns three sibling payloads:

```typescript
{
  // 1. Concise JSON for widget AND model consumption
  // Keep under 4k tokens for optimal performance
  structuredContent: {
    recipe_id: "uuid",
    title: "Chicken Soup",
    calories: 350,
    // ... essential data
  },

  // 2. Optional narration for model's response (Markdown/plaintext)
  content: [
    { type: "text", text: "Recipe 'Chicken Soup' saved successfully!" }
  ],

  // 3. Large or sensitive data ONLY for widget (never reaches model)
  _meta: {
    fullRecipe: { ... },           // Detailed data
    lastSyncedAt: "2024-01-15",    // Metadata
    "openai/toolInvocation/invoking": "Saving...",
    "openai/toolInvocation/invoked": "Saved!"
  }
}
```

**Widget Access:**
- `window.openai.toolOutput` → `structuredContent`
- `window.openai.toolResponseMetadata` → `_meta`

### 6.5 Content Security Policy (CSP)

Configure CSP for widgets that need external resources:

```typescript
_meta: {
  "openai/widgetCSP": {
    // API endpoints widget can call
    connect_domains: ["https://api.mealmate.com"],

    // Static asset hosts (images, fonts)
    resource_domains: ["https://images.mealmate.com"],

    // Allowed destinations for openExternal() calls
    redirect_domains: ["https://recipes.external.com"],

    // Iframe origin allowlist (discouraged, stricter review)
    // frame_domains: ["https://*.embed.com"]
  }
}
```

### 6.6 File Handling

For tools accepting user-provided files (e.g., recipe images):

```typescript
// Tool definition
{
  name: 'upload_recipe_image',
  inputSchema: {
    type: 'object',
    properties: {
      recipe_id: { type: 'string' },
      image: { type: 'object' }  // Will receive file object
    }
  },
  _meta: {
    "openai/fileParams": ["image"]  // Declare file parameters
  }
}

// File parameter structure received:
{
  download_url: "https://...",
  file_id: "file_abc123"
}
```

**Widget file upload:**
```typescript
// Supported formats: image/png, image/jpeg, image/webp
const fileId = await window.openai.uploadFile(file);
```

### 6.7 Localization & Client Hints

ChatGPT sends context metadata in requests:

```typescript
// Available in _meta of incoming requests
_meta: {
  "openai/locale": "ru-RU",              // RFC 4647 locale code
  "openai/userAgent": { ... },           // Device info
  "openai/userLocation": { ... }         // For analytics only
}
```

**Security Note:** Never rely on these hints for authorization. Enforce auth server-side.

---

## 7. Authentication

### 7.1 OAuth 2.1 Flow

ChatGPT Apps use OAuth 2.1 with PKCE for authentication:

```
1. ChatGPT queries /.well-known/oauth-protected-resource
2. ChatGPT registers via dynamic client registration → gets client_id
3. User invokes tool requiring auth
4. ChatGPT initiates authorization code + PKCE flow
5. User authorizes in browser popup
6. ChatGPT exchanges code for access token
7. Token attached to MCP requests: Authorization: Bearer <token>
```

**Redirect URIs to register:**
- Production: `https://chatgpt.com/connector_platform_oauth_redirect`
- Review: `https://platform.openai.com/apps-manage/oauth`

### 7.2 Protected Resource Metadata

Host metadata at `/.well-known/oauth-protected-resource`:

```json
{
  "resource": "https://api.mealmate.com/mcp",
  "authorization_servers": ["https://auth.mealmate.com"],
  "scopes_supported": ["read", "write", "profile"]
}
```

When blocking unauthenticated requests, return:
```
WWW-Authenticate: Bearer realm="mealmate",
  resource_metadata="https://api.mealmate.com/.well-known/oauth-protected-resource"
```

### 7.3 Token Verification

**Your server MUST verify tokens:**
- Validate signature using authorization server's JWKS
- Verify issuer (`iss`) matches your auth server
- Check expiration (`exp`) and not-before (`nbf`)
- Confirm audience (`aud`) matches your resource server
- Verify required scopes are present

Return `401 Unauthorized` with `WWW-Authenticate` challenge on failure.

### 7.4 Security Schemes for Tools

Tools can declare authentication requirements:

```typescript
{
  name: 'save_recipe',
  securitySchemes: ['oauth2'],  // Requires authentication
  // ...
}

// For optional auth (try anonymous first):
{
  name: 'get_public_recipes',
  securitySchemes: ['noauth', 'oauth2'],  // Anonymous allowed
}
```

**Initial Implementation:** For MVP, use Supabase Auth with anonymous users tied to ChatGPT session ID, stored in widget state. Full OAuth can be added later.

---

## 8. State Management

### 8.1 Three-Part State Architecture

| Type | Location | Persistence | Examples |
|------|----------|-------------|----------|
| **Business Data** | Supabase | Long-lived | Recipes, meal plans, shopping lists |
| **UI State** | Widget instance | Message-scoped | Selected tab, expanded panels, sort order |
| **Cross-Session State** | Supabase + widget state | Durable | User preferences, view modes |

**Key Insight:** Widget state is scoped per `message_id/widgetId` pair. Each tool response creates a fresh widget instance.

### 8.2 Widget State APIs

```typescript
// Read current state
const state = window.openai.widgetState;

// Write state (synchronous API, async persistence)
window.openai.setWidgetState({
  selectedRecipeId: "abc123",
  viewMode: "grid"
});
```

No awaiting required - treat like React state updates.

### 8.3 useWidgetState Hook

For React applications, use the `useWidgetState` hook:

```typescript
import { useWidgetState } from '../hooks/use-widget-state';

interface RecipeViewState {
  selectedId: string | null;
  viewMode: 'grid' | 'list';
}

function RecipeList() {
  const [state, setState] = useWidgetState<RecipeViewState>({
    selectedId: null,
    viewMode: 'grid'
  });

  // State hydrates from window.openai.widgetState on mount
  // Writes automatically sync back via setWidgetState

  return (
    <div>
      <button onClick={() => setState({ ...state, viewMode: 'list' })}>
        List View
      </button>
      {/* ... */}
    </div>
  );
}
```

### 8.4 Server-Driven Data Flow

Pattern for maintaining consistency:

```
1. User action in widget (e.g., delete recipe)
2. Widget calls: window.openai.callTool('delete_recipe', { id: '...' })
3. Server processes, updates Supabase
4. Server returns updated data snapshot
5. Widget re-renders with new data + preserved UI state
```

**Key Principle:** Server is the single source of truth for business data. Widget state is for UI preferences only.

### 8.5 Image IDs in Widget State

For image-handling widgets:

```typescript
interface WidgetState {
  modelContent: string;        // Text visible to model
  privateContent: object;      // UI-only state
  imageIds: string[];          // File IDs from uploadFile() or file params
}
```

---

## 9. Frontend Design

### 9.1 Widget Views

1. **Main Dashboard** (`/`)
   - Quick stats (this week's plan, recipes saved)
   - Recent recipes
   - Current meal plan preview
   - Quick actions

2. **Recipe Collection** (`/recipes`)
   - Grid/list view of saved recipes
   - Search and filter
   - Favorite toggle
   - Add to meal plan action

3. **Recipe Detail** (`/recipes/:id`)
   - Full recipe display
   - Ingredients with checkboxes
   - Step-by-step instructions
   - Nutrition breakdown
   - Serving size adjuster

4. **Meal Planner** (`/meal-plan`)
   - Calendar view (day/week)
   - Daily nutrition totals

5. **Shopping List** (`/shopping`)
   - Categorized item list
   - Check-off functionality
   - Clear completed action

6. **Settings** (`/settings`)
   - Dietary goals
   - Family members
   - Language preference

### 9.2 Display Modes

Use `window.openai.requestDisplayMode()` to change modes:

```typescript
// Request fullscreen for meal plan calendar
window.openai.requestDisplayMode('fullscreen');

// Request PiP (mobile may coerce to fullscreen)
window.openai.requestDisplayMode('pip');

// Back to inline
window.openai.requestDisplayMode('inline');
```

**Dynamic Height:** Use `window.openai.notifyIntrinsicHeight()` to prevent scroll clipping:

```typescript
useEffect(() => {
  const height = containerRef.current?.scrollHeight;
  if (height) {
    window.openai.notifyIntrinsicHeight(height);
  }
}, [content]);
```

### 9.3 Widget Runtime APIs

| API | Purpose |
|-----|---------|
| `window.openai.callTool(name, args)` | Invoke MCP tools from widget |
| `window.openai.sendFollowUpMessage(text)` | Insert conversational messages |
| `window.openai.uploadFile(file)` | Upload images (png, jpeg, webp) |
| `window.openai.getFileDownloadUrl(fileId)` | Get temporary download URL |
| `window.openai.requestModal(config)` | Spawn ChatGPT-owned modals |
| `window.openai.openExternal(url)` | Open vetted external links |
| `window.openai.requestClose()` | Close the widget |

**Context Signals:**
- `window.openai.theme` - Dark/light mode
- `window.openai.displayMode` - Current layout
- `window.openai.maxHeight` - Container constraints
- `window.openai.safeArea` - Safe viewport boundaries
- `window.openai.locale` - Language/region
- `window.openai.userAgent` - Device detection

### 9.4 Component Hierarchy

```
<App>
├── <AppsSDKUIProvider>         # OpenAI UI provider
├── <IntlProvider>              # i18n context
├── <WidgetStateProvider>       # OpenAI widget state
├── <Router>
│   ├── <Layout>
│   │   ├── <Header>
│   │   │   └── <Navigation>
│   │   └── <MainContent>
│   │       └── <Routes>
│   │           ├── <Dashboard />
│   │           ├── <RecipeList />
│   │           ├── <RecipeDetail />
│   │           ├── <MealPlanner />
│   │           ├── <ShoppingList />
│   │           └── <Settings />
```

---

## 10. Internationalization (i18n)

### 10.1 Strategy

Use `react-intl` with JSON message files. Read locale from `window.openai.locale`.

### 10.2 Implementation

```typescript
import { IntlProvider } from 'react-intl';
import { useOpenAiGlobal } from '../hooks/use-openai-global';
import en from './en.json';
import ru from './ru.json';

const messages = { en, ru };

export function I18nProvider({ children }) {
  const { locale } = useOpenAiGlobal();
  const resolvedLocale = locale?.startsWith('ru') ? 'ru' : 'en';

  return (
    <IntlProvider
      messages={messages[resolvedLocale]}
      locale={resolvedLocale}
      defaultLocale="en"
    >
      {children}
    </IntlProvider>
  );
}
```

---

## 11. Build vs Modify Decision

### Recommendation: **Hybrid Approach**

**Create a new repository** but **copy reusable assets** from places-gpt:

1. **Create new repo**: `mealmate/` with clean structure
2. **Copy from places-gpt**:
   - `tsconfig.*.json` files
   - `vite.config.mts` (adapt for new structure)
   - `src/use-*.ts` hooks (widget state, props, display mode)
   - `src/types.ts` (OpenAI types)
3. **Add new**:
   - `@openai/apps-sdk-ui` - Official OpenAI UI components
   - `react-intl` - i18n
   - `zustand` - State management
4. **Build from scratch**:
   - NestJS backend
   - React components (using Apps SDK UI)
   - Data models
   - Supabase schema

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [x] Create new repository with monorepo structure
- [x] Set up pnpm workspace
- [x] Set up NestJS project with MCP server
- [x] Set up Supabase schema
- [ ] Implement OAuth authentication
- [ ] Create minimal widget that loads

### Phase 2: Core Features (Week 3-4)
- [ ] Implement recipe CRUD (backend + frontend)
- [ ] Build recipe list and detail views
- [ ] Set up react-intl with EN/RU translations
- [ ] Build user profile and goals settings

### Phase 3: Meal Planning (Week 5-6)
- [ ] Implement meal plan CRUD
- [ ] Build meal plan calendar view
- [ ] Build daily/weekly nutrition summary

### Phase 4: Shopping & Family (Week 7-8)
- [ ] Implement shopping list generation
- [ ] Build shopping list view with categories
- [ ] Implement family member management

### Phase 5: Polish & Deploy (Week 9-10)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Production deployment

---

## 13. Resolved & Open Questions

### Resolved

| Question | Resolution |
|----------|------------|
| **Authentication** | Use OAuth 2.1 with PKCE via Supabase Auth. For MVP, can use anonymous users tied to ChatGPT session stored in widget state. |
| **Widget state scope** | Widget state is message-scoped (per message_id/widgetId pair). Use `useWidgetState` hook for React. |
| **File uploads** | Use `window.openai.uploadFile()` API. Supported: png, jpeg, webp. |
| **Display modes** | Inline (default), Fullscreen, PiP. Use `requestDisplayMode()` to change. |
| **External links** | Use `window.openai.openExternal()` with CSP redirect_domains configured. |

### Open

1. **Recipe Images**: User uploads via `uploadFile()`, or allow pasting URLs?
2. **Offline Support**: Cache recipes locally in widget state for offline viewing?
3. **Multi-device Sync**: Real-time sync via Supabase Realtime?
4. **Monetization**: Premium features for future?

---

## Appendix A: Environment Variables

```bash
# apps/server/.env

# Server
PORT=8000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx

# OAuth (when implementing full auth)
# OAUTH_ISSUER=https://auth.mealmate.com
# OAUTH_AUDIENCE=https://api.mealmate.com
```

---

## Appendix B: Key Dependencies

### Frontend (apps/widget)
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@openai/apps-sdk-ui": "latest",
    "react-intl": "^7.0.0",
    "zustand": "^5.0.0",
    "immer": "^10.0.0"
  }
}
```

### Backend (apps/server)
```json
{
  "dependencies": {
    "@nestjs/core": "^10.0.0",
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@modelcontextprotocol/sdk": "^0.5.0",
    "zod": "^3.0.0"
  }
}
```

---

## Appendix C: Useful Commands

```bash
# Development
pnpm dev              # Start all apps in dev mode
pnpm dev:widget       # Start widget only
pnpm dev:server       # Start server only

# Build
pnpm build            # Build all apps

# Database
pnpm db:migrate       # Run Supabase migrations
```

---

*Document Version: 2.0*
*Last Updated: January 2026*
