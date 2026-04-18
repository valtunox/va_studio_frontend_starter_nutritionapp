<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Templates-20-8B5CF6?style=for-the-badge" alt="20 Templates" />
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge" alt="MIT License" />
</p>

<h1 align="center">VA Studio Frontend Starter</h1>

<p align="center">
  <strong>20 production-ready, fully responsive React templates with dark mode, theme switching, and zero external API dependencies.</strong>
</p>

<p align="center">
  Open source collection of beautifully crafted UI templates for rapid prototyping and production apps.<br/>
  Built with React 18, Vite 6, Tailwind CSS, and shadcn/ui components.
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> &bull;
  <a href="#-templates">Templates</a> &bull;
  <a href="#-features">Features</a> &bull;
  <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> &bull;
  <a href="#-contributing">Contributing</a>
</p>

<img width="1907" height="922" alt="image" src="https://github.com/user-attachments/assets/f0300cc5-d85b-4c63-a10d-71592d9ae07b" />


---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/valtunox/va_studio_frontend_starter.git
cd va_studio_frontend_starter

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3008](http://localhost:3008) and use the template switcher on the right side to browse all 20 templates.

## Templates

### Landing Pages & Websites

| Template | Description |
|----------|-------------|
| **SaaS Landing** | Modern SaaS landing with purple/blue gradients, hero, pricing tiers, testimonials |
| **SaaS Dark** | Developer-tools aesthetic (Vercel/Supabase vibe) with neon cyan/emerald glows, bento grid |
| **Business** | B2B consulting site with case studies, services, and outcomes |
| **Organization** | Nonprofit/advocacy site with mission, programs, and impact stats |
| **Portfolio** | Developer portfolio with projects showcase, skills, and contact form |
| **Blog** | Blog platform with posts, tags, search, and archive |

### E-Commerce & Marketplace

| Template | Description |
|----------|-------------|
| **E-Commerce** | Lazada/eBay-style marketplace with product browsing, flash deals, sellers, and categories |

### Business Applications

| Template | Description |
|----------|-------------|
| **Dashboard** | Analytics dashboard with KPI cards, charts, and trends |
| **CRM** | Customer relationship management with contacts, pipeline, and leads |
| **ERP** | Enterprise resource planning with inventory, procurement, and finance modules |
| **Finance** | Financial management with transactions, budgets, and forecasts |
| **Marketing** | Campaign management with social media, email, and analytics |

### Vertical Apps

| Template | Description |
|----------|-------------|
| **Nutrition App** | Mobile-first food tracking app with meal logging, recipes, and macro tracking |
| **Diet** | Nutrition dashboard with meal plans, grocery lists, and progress tracking |
| **AI Assistant** | Chat interface with agent list, AI thinking visualization, and connectors |
| **Calendar** | Calendly-style booking with calendar grid, event types, and availability |

### Auth & Forms

| Template | Description |
|----------|-------------|
| **Login** | Login form with email/password and OAuth (Google, GitHub, Microsoft) |
| **Register** | Registration form with password strength and OAuth |
| **Form Builder** | Multi-step registration with 4 steps, validation, and review |
| **Onboarding** | User onboarding wizard with progress tracking and theme selection |

## Features

- **20 Production-Ready Templates** -- Each template is a complete, self-contained UI
- **Dark Mode** -- Every template supports light and dark themes out of the box
- **Theme System** -- 3 color themes (Purple, Ocean, Slate) switchable at runtime
- **Code Splitting** -- Templates are lazy-loaded for fast initial page load
- **Template Switcher** -- Sticky side panel to browse and switch templates instantly
- **Responsive Design** -- Mobile-first layouts that work on all screen sizes
- **Zero API Dependencies** -- All templates use mock data, ready to plug in your backend
- **shadcn/ui Components** -- 12 reusable UI primitives (Button, Card, Input, Dialog, Tabs, etc.)
- **Custom Charts** -- Lightweight SVG charts (Sparkline, Bar, Donut, Area) with no external deps
- **Backend Ready** -- Health check banner, API proxy config, and backend status context included

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 |
| **Build** | Vite 6 |
| **Styling** | Tailwind CSS 3.4 |
| **UI Components** | shadcn/ui + Radix UI + Headless UI |
| **Icons** | Lucide React (470+ icons) |
| **Routing** | React Router 7 |
| **Fonts** | Inter, Plus Jakarta Sans, JetBrains Mono |

## Project Structure

```
va_studio_frontend_starter/
├── src/
│   ├── App.jsx                    # Router + template registry
│   ├── main.jsx                   # React entry point
│   ├── index.css                  # Design tokens + animations
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (12)
│   │   └── shared/                # TemplateSwitcher, ThemeSwitcher, MiniChart, etc.
│   ├── context/                   # Theme + Backend status providers
│   ├── hooks/                     # useBackendStatus
│   └── lib/                       # utils (cn), API client
├── templates/                     # 20 self-contained templates
│   ├── aiassistant/
│   ├── blog/
│   ├── business/
│   ├── calendar/
│   ├── crm/
│   ├── dashboard/
│   ├── diet/
│   ├── ecommerce/
│   ├── erp/
│   ├── finance/
│   ├── formbuilder/
│   ├── login/
│   ├── marketing/
│   ├── nutritionapp/
│   ├── onboarding/
│   ├── organization/
│   ├── portfolio/
│   ├── register/
│   ├── saas/
│   └── saas2/
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Adding a New Template

1. Create a new directory under `templates/`:

```bash
mkdir templates/mytemplate
```

2. Create `templates/mytemplate/App.jsx`:

```jsx
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'

export default function MyTemplate() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <ThemeSwitcher />
      {/* Your template content */}
    </div>
  )
}
```

3. Register it in `src/App.jsx`:

```js
const templates = {
  // ...existing templates
  mytemplate: lazy(() => import('../templates/mytemplate/App.jsx')),
}
```

4. Add it to `src/components/shared/TemplateSwitcher.jsx`:

```js
{ id: 'mytemplate', label: 'My Template', icon: Layout, color: 'text-blue-500' },
```

## Scripts

```bash
npm run dev       # Start dev server on port 3008
npm run build     # Production build to /build
npm run preview   # Preview production build locally
```

## Contributing

Contributions are welcome! Whether it's a new template, a bug fix, or a design improvement -- we'd love your help.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-template`)
3. Commit your changes (`git commit -m 'feat: add amazing template'`)
4. Push to the branch (`git push origin feat/amazing-template`)
5. Open a Pull Request

### Contribution Ideas

- New templates (real estate, social media, music player, chat app, etc.)
- Accessibility improvements
- Animation enhancements
- Mobile-specific optimizations
- Additional UI components

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with care by the <a href="https://github.com/valtunox">VA Studio</a> team and contributors.
</p>
