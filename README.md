# 🚀 ChatPulse

**The Secure, Serverless Chat Widget for Modern Sites.**

Add AI-powered chat to your website in minutes using **Cloudflare Workers**. No servers to manage, no exposed API keys, and blazing fast performance at the edge.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Size](https://img.shields.io/badge/size-<25KB-green.svg)
![Architecture](https://img.shields.io/badge/architecture-serverless-orange.svg)

![ChatPulse Demo](./screenshots/demo.png)

---

## ⚡ Why Serverless?

- **🔒 Enhanced Security**: Keep your OpenAI/Anthropic API keys safe on the server-side (in Cloudflare Workers), never exposed in frontend code.
- **🚀 Edge Performance**: Your backend runs on Cloudflare's global network, ensuring low latency for users worldwide.
- **💰 Cost Effective**: Cloudflare Workers offers a generous free tier (100,000 requests/day).
- **📈 Infinite Scalability**: Automatically handles traffic spikes without managing servers.

---

## ✨ Features

- 🎨 **Modern Design** - Sleek, shadcn-inspired UI with smooth animations
- 🪶 **Ultra Lightweight** - <25KB minified + gzipped, zero dependencies
- 🔗 **Universal Compatibility** - Works with any backend, optimized for Cloudflare Workers
- 💾 **Message Persistence** - localStorage for conversation history
- 📝 **Full Markdown Support** - Bold, italic, code blocks, links, lists, tables
- 📱 **Fully Responsive** - Perfect on mobile and desktop
- ♿ **Accessible** - WCAG compliant

---

## 🚀 Quick Start (Serverless)

### 1. Deploy Your Backend (Cloudflare Worker)

We provide a ready-to-use example in [`examples/cloudflare-worker`](./examples/cloudflare-worker/).

1. **Install Wrangler:**
   ```bash
   npm install -g wrangler
   ```

2. **Deploy the Worker:**
   ```bash
   cd examples/cloudflare-worker
   wrangler deploy
   ```

3. **Get your Worker URL:** (e.g., `https://chatpulse-backend.your-subdomain.workers.dev`)

### 2. Add Widget to Your Website

**Download files** (`widget.js`, `widget.css`, `avatar.png`) or usage via CDN.

```html
<!-- 1. Add Styles -->
<link rel="stylesheet" href="widget.css">

<!-- 2. Add Widget Container (or allow script to create it) -->
<script src="widget.js"></script>

<!-- 3. Configure & Initialize -->
<script>
    ChatWidget.config({
        webhookUrl: 'https://chatpulse-backend.your-subdomain.workers.dev', // Your Worker URL
        welcomeMessage: 'Hi! How can I help you today?',
        primaryColor: '#F03E3E' // Optional branding
    });
</script>
```

---

## 📖 Configuration

| Option | Description | Default |
|--------|-------------|---------|
| `webhookUrl` | URL of your Cloudflare Worker (or any endpoint) | Required |
| `welcomeMessage` | Initial greeting message | "Hi, how can I help?" |
| `primaryColor` | Accent color for buttons and user bubbles | `#F03E3E` |
| `maxRetries` | Retry attempts for failed requests | 3 |

---

## 🛠️ Customization

### Branding
- **Avatar**: Replace `avatar.png` with your own logo.
- **Colors**: Edit `widget.css` variables or pass `primaryColor` in config.
- **Header Text**: Edit the HTML structure in `widget.js` (or `widget.html` if using raw HTML).

### Backend Logic
Edit your Cloudflare Worker (`examples/cloudflare-worker/worker.js`) to change how the bot replies.
- Connect to **OpenAI** / **ChatGPT**
- Connect to **Anthropic Claude**
- Connect to **Supabase** or any database
- Trigger **n8n** or **Zapier** workflows securely

---

## 🔒 Security Best Practices

1. **Never** put API keys in your frontend HTML/JS.
2. Always use **Secrets** in Cloudflare Workers for keys (`wrangler secret put OPENAI_API_KEY`).
3. Configure **CORS** in your Worker to only allow requests from your specific domains in production.

---

## 📁 Project Structure

```
chatpulse/
├── examples/
│   └── cloudflare-worker/   # Serverless backend example
├── widget.js                # Core widget logic
├── widget.css               # Styling
├── embed.js                 # Loader script
├── demo.html                # Local testing page
├── avatar.png               # Default avatar
└── README.md                # Documentation
```

---

## 📄 License

MIT License. Free for personal and commercial use.

---

**Made with ❤️ for the Serverless Community**
