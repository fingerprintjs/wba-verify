# WBA Verify

Web Bot Authentication Verification tool by Fingerprint

WBA Verify is a frontend app that allows developers to test and validate Web Bot Authentication (WBA) requests end-to-end

It is designed to verify that HTTP Message Signatures are generated correctly by automated clients (bots, agents, crawlers) according to RFC 9421, and that public key discovery and cryptographic validation work as expected.

This project pairs with the backend verification service:

⚙️ Backend API: https://github.com/fingerprintjs/wba-verify-api

## 🚀 Tech Stack

- **[Astro](https://astro.build/)** v5.16+ - Modern web framework
- **[Svelte](https://svelte.dev/)** v5.17+ - Component framework with modern runes syntax
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vercel](https://vercel.com/)** - Deployment platform

## 📦 Project Structure

```
/
├── public/              # Static assets (favicon, images, etc.)
├── src/
│   ├── components/      # Svelte components
│   ├── layouts/         # Astro layouts
│   └── pages/           # Astro pages (routes)
├── astro.config.mjs     # Astro configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── vercel.json          # Vercel deployment configuration
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Clone the repository:

```bash
git clone https://github.com/fingerprintjs/wba-verify.git
cd wba-verify
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:4321/`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🚢 Deployment

### Deploy to Vercel

#### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Deploy:

```bash
vercel
```

#### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Import the repository in [Vercel Dashboard](https://vercel.com/new)
3. Vercel will automatically detect the Astro framework
4. Click "Deploy"

The `vercel.json` configuration ensures proper build settings.

### Environment Variables

Create a `.env` file based on `.env.example` for local development. For production, add environment variables in the Vercel dashboard.

## 📝 Adding Components

### Svelte Components

Create `.svelte` files in `src/components/` using Svelte 5's modern runes syntax:

```svelte
<script lang="ts">
  let count = $state(0);

  function increment() {
    count += 1;
  }
</script>

<button onclick={increment}>{count}</button>

<style>
  /* Your styles */
</style>
```

Use in Astro pages with the `client:load` directive for interactivity:

```astro
---
import MyComponent from '../components/MyComponent.svelte'
---

<MyComponent client:load />
```

## 🔧 Configuration

- **Astro**: Edit `astro.config.mjs` to add integrations or modify settings
- **TypeScript**: Edit `tsconfig.json` for TypeScript options
- **Vercel**: Edit `vercel.json` for deployment configuration

## 📄 License

See the LICENSE file for details.
