import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Resource, ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';

export interface WidgetCSP {
  connect_domains?: string[];
  resource_domains?: string[];
  redirect_domains?: string[];
}

export interface Widget {
  id: string;
  title: string;
  description: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  prefersBorder?: boolean;
  csp?: WidgetCSP;
}

@Injectable()
export class WidgetsService {
  private readonly logger = new Logger(WidgetsService.name);
  private widgets: Widget[] = [];
  private widgetsByUri = new Map<string, Widget>();
  private assetsDir: string;
  private bundledJs: string = '';
  private bundledCss: string = '';

  constructor() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    // Assets are built to the root /assets folder in the monorepo
    // From: apps/server/dist/mcp/widgets.service.js
    // To: assets/
    this.assetsDir = path.resolve(__dirname, '..', '..', '..', '..', 'assets');

    this.logger.log(`Looking for widget assets in: ${this.assetsDir}`);
    this.loadBundledAssets();
    this.initializeWidgets();
  }

  private loadBundledAssets() {
    const jsPath = path.join(this.assetsDir, 'meal-planner.js');
    const cssPath = path.join(this.assetsDir, 'meal-planner.css');

    if (fs.existsSync(jsPath)) {
      this.bundledJs = fs.readFileSync(jsPath, 'utf8');
      this.logger.log(`Loaded widget JS bundle: ${this.bundledJs.length} bytes`);
    } else {
      this.logger.warn(`Widget JS bundle not found at ${jsPath}`);
    }

    if (fs.existsSync(cssPath)) {
      this.bundledCss = fs.readFileSync(cssPath, 'utf8');
      this.logger.log(`Loaded widget CSS bundle: ${this.bundledCss.length} bytes`);
    } else {
      this.logger.warn(`Widget CSS bundle not found at ${cssPath}`);
    }
  }

  private initializeWidgets() {
    // Default CSP for all widgets
    const defaultCsp: WidgetCSP = {
      connect_domains: [process.env.BASE_URL || 'http://localhost:8000'],
      resource_domains: [],
      redirect_domains: [],
    };

    const widgetDefinitions: Omit<Widget, 'templateUri' | 'html'>[] = [
      {
        id: 'mealmate-dashboard',
        title: 'MealMate Dashboard',
        description: 'Overview of your recipes, meal plans, and quick actions',
        invoking: 'Loading your dashboard...',
        invoked: 'Here is your MealMate dashboard',
        prefersBorder: false,
        csp: defaultCsp,
      },
      {
        id: 'mealmate-recipes',
        title: 'Recipe Collection',
        description: 'Browse and manage your saved recipes',
        invoking: 'Fetching your recipes...',
        invoked: 'Here are your saved recipes',
        prefersBorder: false,
        csp: defaultCsp,
      },
      {
        id: 'mealmate-recipe-detail',
        title: 'Recipe Details',
        description: 'Full recipe with ingredients, instructions, and nutrition',
        invoking: 'Loading recipe details...',
        invoked: 'Here is the recipe',
        prefersBorder: false,
        csp: defaultCsp,
      },
      {
        id: 'mealmate-meal-plan',
        title: 'Meal Plan Calendar',
        description: 'View and manage your weekly meal schedule',
        invoking: 'Loading your meal plan...',
        invoked: 'Here is your meal plan',
        prefersBorder: false,
        csp: defaultCsp,
      },
      {
        id: 'mealmate-shopping-list',
        title: 'Shopping List',
        description: 'Organized shopping list from your meal plan',
        invoking: 'Generating shopping list...',
        invoked: 'Here is your shopping list',
        prefersBorder: false,
        csp: defaultCsp,
      },
      {
        id: 'mealmate-settings',
        title: 'Settings',
        description: 'Manage your dietary goals and preferences',
        invoking: 'Loading settings...',
        invoked: 'Here are your settings',
        prefersBorder: false,
        csp: defaultCsp,
      },
    ];

    for (const def of widgetDefinitions) {
      const widget: Widget = {
        ...def,
        templateUri: `ui://widget/${def.id}.html`,
        html: this.readWidgetHtml(def.id),
      };

      this.widgets.push(widget);
      this.widgetsByUri.set(widget.templateUri, widget);
    }
  }

  private readWidgetHtml(componentName: string): string {
    // If we have bundled assets, generate HTML dynamically
    if (this.bundledJs && this.bundledCss) {
      return this.generateWidgetHtml(componentName);
    }

    // Fallback: look for pre-built HTML files
    if (fs.existsSync(this.assetsDir)) {
      const directPath = path.join(this.assetsDir, `${componentName}.html`);
      if (fs.existsSync(directPath)) {
        return fs.readFileSync(directPath, 'utf8');
      }

      // Look for versioned file
      const candidates = fs
        .readdirSync(this.assetsDir)
        .filter((file) => file.startsWith(`${componentName}-`) && file.endsWith('.html'))
        .sort();

      const fallback = candidates[candidates.length - 1];
      if (fallback) {
        return fs.readFileSync(path.join(this.assetsDir, fallback), 'utf8');
      }
    }

    return `<!DOCTYPE html><html><body><div id="root">Widget ${componentName} - Build required</div></body></html>`;
  }

  private generateWidgetHtml(componentName: string): string {
    // Map widget ID to the component/view name used in the React app
    const viewMap: Record<string, string> = {
      'mealmate-dashboard': 'dashboard',
      'mealmate-recipes': 'recipes',
      'mealmate-recipe-detail': 'recipe-detail',
      'mealmate-meal-plan': 'meal-plan',
      'mealmate-shopping-list': 'shopping-list',
      'mealmate-settings': 'settings',
    };

    const view = viewMap[componentName] || 'dashboard';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MealMate</title>
  <style>${this.bundledCss}</style>
</head>
<body>
  <div id="root" data-view="${view}" data-widget-id="${componentName}"></div>
  <script type="module">${this.bundledJs}</script>
</body>
</html>`;
  }

  getWidgetMeta(widget: Widget): Record<string, unknown> {
    const meta: Record<string, unknown> = {
      // Link tool to widget template
      'openai/outputTemplate': widget.templateUri,

      // Status messages during invocation
      'openai/toolInvocation/invoking': widget.invoking,
      'openai/toolInvocation/invoked': widget.invoked,

      // Enable widget to call this tool via window.openai.callTool
      'openai/widgetAccessible': true,

      // Visual preferences
      'openai/widgetPrefersBorder': widget.prefersBorder ?? false,

      // Widget description for model context
      'openai/widgetDescription': widget.description,
    };

    // Add CSP if configured
    if (widget.csp) {
      meta['openai/widgetCSP'] = widget.csp;
    }

    return meta;
  }

  getWidgetByUri(uri: string): Widget | undefined {
    return this.widgetsByUri.get(uri);
  }

  getWidgetById(id: string): Widget | undefined {
    return this.widgets.find((w) => w.id === id);
  }

  getResources(): Resource[] {
    return this.widgets.map((widget) => ({
      uri: widget.templateUri,
      name: widget.title,
      description: `${widget.title} widget markup`,
      mimeType: 'text/html+skybridge',
      _meta: this.getWidgetMeta(widget),
    }));
  }

  getResourceTemplates(): ResourceTemplate[] {
    return this.widgets.map((widget) => ({
      uriTemplate: widget.templateUri,
      name: widget.title,
      description: `${widget.title} widget markup`,
      mimeType: 'text/html+skybridge',
      _meta: this.getWidgetMeta(widget),
    }));
  }
}
