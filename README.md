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

## ⚡ Serverless Configuration (Required)

ChatPulse requires a backend to handle messages securely. We recommend **Cloudflare Workers** (Free, fast, and secure).

### Option 1: The "5-Minute" Setup (No Code Tools)

1. **Log in** to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Go to **Workers & Pages** → **Create Application** → **Create Worker**.
3. Name it `chatpulse-backend` and click **Deploy**.
4. Click **Edit Code**.
5. **Delete everything** and paste this exact code:

```javascript
export default {
  async fetch(request, env, ctx) {
    // 1. Handle CORS (Allow ChatPulse to talk to this worker)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*', // Change to your domain in production
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // 2. Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // 3. Handle the Chat Logic
    try {
      const { message, sessionId } = await request.json();

      // --- YOUR AI LOGIC GOES HERE ---
      // Example: Simple Echo Bot
      // Replace this with your OpenAI / Anthropic API call
      const responseText = `You said: "${message}"`; 
      // -------------------------------

      return new Response(JSON.stringify({ message: responseText }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Server Error' }), { status: 500 });
    }
  },
};
```

6. Click **Save and Deploy**.
7. Copy your **Worker URL** (e.g., `https://chatpulse-backend.your-name.workers.dev`).
8. Paste this URL into your `widget.js` config:

```javascript
ChatWidget.config({
    webhookUrl: 'https://chatpulse-backend.your-name.workers.dev', 
    // ...
});
```

### Option 2: Advanced Setup (CLI)

For developers who prefer command line, check out the [`examples/cloudflare-worker`](./examples/cloudflare-worker/) directory for a production-ready template using `wrangler`.

---

## 🔌 Connecting to AI or Workflows

The Cloudflare Worker acts as a bridge. You can connect it to anything!

### Option A: Direct AI (OpenAI / Claude)

**Worker Code:**
```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${env.OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: message }]
  })
});
// ... handle response ...
```

### Option B: Workflow Automation (n8n, Zapier, Make)

Replace the contents of the `try { ... }` block in your worker with this:

```javascript
    try {
      const { message, sessionId } = await request.json();

      // ↓↓↓ PASTE THIS CODE HERE ↓↓↓
      const n8nResponse = await fetch('https://your-n8n-instance.com/webhook/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId })
      });

      const data = await n8nResponse.json();
      // Adjust 'data.output' to match your n8n response node structure
      const responseText = data.output || data.message;
      // ↑↑↑ END PASTE ↑↑↑

      return new Response(JSON.stringify({ message: responseText }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) { ... }
```

---

## 💻 How to Embed on Your Website

To add ChatPulse to your site, simply paste the following code **before the closing `</body>` tag** of your website's HTML.

```html
<!-- 1. Load Styles -->
<link rel="stylesheet" href="https://your-cdn.com/widget.css">

<!-- 2. Load the Widget Script -->
<script src="https://your-cdn.com/widget.js"></script>

<!-- 3. Configure & Initialize (Add this right after the script) -->
<script>
    ChatWidget.config({
        webhookUrl: 'https://chatpulse-backend.your-subdomain.workers.dev', // ← Your Worker URL from above
        welcomeMessage: 'Hi! How can I help you today?',
        primaryColor: '#F03E3E'
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
