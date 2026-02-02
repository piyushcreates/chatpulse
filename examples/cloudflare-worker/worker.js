export default {
    async fetch(request, env, ctx) {
        // -----------------------------------------------------------------------
        // 1. CORS Setup (Required for the widget to talk to this worker)
        // -----------------------------------------------------------------------
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*', // Change to your domain in production
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }

        // -----------------------------------------------------------------------
        // 2. Chat Logic
        // -----------------------------------------------------------------------
        try {
            const { message, sessionId } = await request.json();
            let responseText = "";

            // =======================================================================
            // OPTION A: Simple Echo Bot (Default)
            // =======================================================================
            responseText = `You said: "${message}"`;


            // =======================================================================
            // OPTION B: n8n / Zapier / Make (Workflow Automation)
            // Uncomment the block below to use this:
            // =======================================================================
            /*
            const n8nUrl = 'https://your-n8n-instance.com/webhook/chatbot';
            
            const n8nResponse = await fetch(n8nUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message, sessionId })
            });
            
            const data = await n8nResponse.json();
            // Ensure this matches your n8n output node structure
            responseText = data.output || data.message || "No response received from n8n.";
            */


            // =======================================================================
            // OPTION C: OpenAI (ChatGPT)
            // Uncomment the block below to use this:
            // Requires OPENAI_API_KEY to be set in Cloudflare Worker Settings
            // =======================================================================
            /*
            const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
      
            const openaiData = await openaiResponse.json();
            responseText = openaiData.choices[0].message.content;
            */


            // -----------------------------------------------------------------------
            // 3. Return Response
            // -----------------------------------------------------------------------
            return new Response(JSON.stringify({ message: responseText }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });

        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
    },
};
