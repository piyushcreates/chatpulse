# Cloudflare Worker Backend for ChatPulse

This example shows how to deploy a secure, serverless backend for your ChatPulse widget using [Cloudflare Workers](https://workers.cloudflare.com/).

## Why Serverless?
- **Security:** Hide your API keys (OpenAI, Anthropic) on the server side.
- **Speed:** Runs on Cloudflare's global edge network (low latency).
- **Cost:** Generous free tier (100k requests/day).
- **No Servers:** No managing infrastructure or scaling issues.

## Setup

1. **Install Wrangler** (Cloudflare CLI):
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Deploy:**
   ```bash
   wrangler deploy
   ```

4. **Copy your Worker URL** (e.g., `https://chatpulse-backend.your-subdomain.workers.dev`).

5. **Update your Widget Config:**
   Use the copied URL as your `webhookUrl` in `widget.js` or the embed script.

## Adding AI (OpenAI Example)

1. Uncomment the OpenAI code block in `worker.js`.
2. Add your OpenAI API key as a secret:
   ```bash
   wrangler secret put OPENAI_API_KEY
   ```
