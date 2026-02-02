export default {
    async fetch(request, env, ctx) {
        // 1. Handle CORS (Cross-Origin Resource Sharing)
        // This allows your widget (on any domain) to talk to this worker
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*', // restricts to specific domains in production
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        // 2. Only allow POST requests
        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }

        try {
            // 3. Parse the incoming JSON from ChatPulse
            const { message, sessionId } = await request.json();

            // --- OPTION 1: Simple Echo Bot (Default) ---
            // const responseText = `You said: "${message}"`;

            // --- OPTION 2: n8n / Zapier / Make Integration ---

            const n8nResponse = await fetch('https://your-n8n-instance.com/webhook/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, sessionId })
            });
            const data = await n8nResponse.json();
            const responseText = data.output || data.message || "No response derived.";


            // --- OPTION 3: OpenAI (Uncomment to use) ---
            /*
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
              // ... (see README for full code)
            });
            */

            // 5. Return the response in the format ChatPulse expects
            return new Response(JSON.stringify({ message: responseText }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*', // Match your CORS setting above
                },
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    },
};

// Example function to handle chat logic
async function handleChatLogic(userMessage, env) {
    // Simulate AI processing delay
    // await new Promise(resolve => setTimeout(resolve, 500)); 

    // Example: Calling OpenAI (if you set OPENAI_API_KEY in secrets)
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }]
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
    */

    return `**Serverless Response:** You said: _"${userMessage}"_`;
}
