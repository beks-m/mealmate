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
    // Widget assets are built to apps/widget/dist/assets/
    // From: apps/server/dist/mcp/widgets.service.js (3 levels up to apps/)
    // Then: widget/dist/assets/
    this.assetsDir = path.resolve(__dirname, '..', '..', '..', 'widget', 'dist', 'assets');

    this.logger.log(`__dirname: ${__dirname}`);
    this.logger.log(`Looking for widget assets in: ${this.assetsDir}`);
    this.logger.log(`Assets dir exists: ${fs.existsSync(this.assetsDir)}`);

    // Also try from process.cwd() as fallback
    if (!fs.existsSync(this.assetsDir)) {
      const cwdPath = path.join(process.cwd(), 'apps', 'widget', 'dist', 'assets');
      this.logger.log(`Trying CWD path: ${cwdPath}`);
      if (fs.existsSync(cwdPath)) {
        this.assetsDir = cwdPath;
        this.logger.log(`Using CWD path for assets`);
      }
    }

    this.loadBundledAssets();
    this.initializeWidgets();
  }

  private loadBundledAssets() {
    const jsPath = path.join(this.assetsDir, 'meal-planner.js');
    const cssPath = path.join(this.assetsDir, 'meal-planner.css');

    this.logger.log(`Checking for JS at: ${jsPath}`);
    this.logger.log(`Checking for CSS at: ${cssPath}`);

    if (fs.existsSync(jsPath)) {
      this.bundledJs = fs.readFileSync(jsPath, 'utf8');
      this.logger.log(`Loaded widget JS bundle: ${this.bundledJs.length} bytes`);
    } else {
      this.logger.warn(`Widget JS bundle not found at ${jsPath}`);
      // List directory contents if it exists
      if (fs.existsSync(this.assetsDir)) {
        const files = fs.readdirSync(this.assetsDir);
        this.logger.log(`Files in assets dir: ${files.join(', ')}`);
      }
    }

    if (fs.existsSync(cssPath)) {
      this.bundledCss = fs.readFileSync(cssPath, 'utf8');
      this.logger.log(`Loaded widget CSS bundle: ${this.bundledCss.length} bytes`);
    } else {
      this.logger.warn(`Widget CSS bundle not found at ${cssPath}`);
    }

    // Log whether we'll use generated HTML or fallback
    if (this.bundledJs && this.bundledCss) {
      this.logger.log(`Both bundles loaded - will use generateWidgetHtml()`);
    } else {
      this.logger.warn(`Missing bundles - will use fallback HTML`);
    }
  }

  private initializeWidgets() {
    const baseUrl = process.env.BASE_URL || 'https://mealmate-server-production.up.railway.app';

    // Default CSP for all widgets
    const defaultCsp: WidgetCSP = {
      connect_domains: [baseUrl],
      resource_domains: [baseUrl],
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
      // Use ui:// scheme for widget template (ChatGPT fetches via MCP ReadResource)
      const widget: Widget = {
        ...def,
        templateUri: `ui://widget/${def.id}.html`,
        html: this.readWidgetHtml(def.id),
      };

      this.widgets.push(widget);
      this.widgetsByUri.set(widget.templateUri, widget);
    }

    this.logger.log(`Initialized ${this.widgets.length} widgets with ui:// URIs`);
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

    this.logger.warn(`Fallback HTML for ${componentName} - bundledJs: ${!!this.bundledJs}, bundledCss: ${!!this.bundledCss}`);
    // If we have bundled assets, use them inline
    if (this.bundledJs && this.bundledCss) {
      return this.generateWidgetHtml(componentName);
    }
    // Otherwise return minimal fallback
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MealMate</title>
</head>
<body>
  <div id="root" style="padding: 20px; font-family: system-ui;">
    <p>Widget assets not available. Please rebuild the widget.</p>
  </div>
</body>
</html>`;
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

    // Full React widget with inlined CSS and JS
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
