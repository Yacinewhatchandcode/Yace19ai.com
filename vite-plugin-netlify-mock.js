export default function netlifyMockPlugin() {
  return {
    name: "vite-plugin-netlify-mock",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith("/api/")) return next();

        // Polyfill Netlify and Request object behavior
        const bodyChunks = [];
        req.on("data", chunk => bodyChunks.push(chunk));
        
        req.on("end", async () => {
          let body = {};
          if (bodyChunks.length > 0) {
            try {
              body = JSON.parse(Buffer.concat(bodyChunks).toString());
            } catch (e) {}
          }

          const sendResponse = (status, data) => {
            res.statusCode = status;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
          };

          const key = process.env.NVIDIA_API_KEY || "";
          const hasNvidiaKey = key && key !== "YOUR_FREE_NVIDIA_API_KEY_HERE";

          if (req.url === "/api/status") {
            return sendResponse(200, {
              status: "online",
              version: "2.0.0",
              timestamp: new Date().toISOString(),
              services: {
                nvidia_nim: hasNvidiaKey ? "configured" : "missing_key",
                agents: "operational",
                voice: "browser_native",
                tts: "browser_native",
              },
              agents: [
                { id: "asirem", status: "online", role: "Orchestrator" },
                { id: "scout", status: "online", role: "Web Search" },
                { id: "codex", status: "online", role: "Code Generator" },
                { id: "sentinel", status: "active", role: "Security" },
                { id: "nexus", status: "online", role: "Knowledge Graph" },
                { id: "bytebot", status: "active", role: "Desktop RPA" },
                { id: "neuron", status: "online", role: "ML Pipeline" },
                { id: "delta", status: "standby", role: "DevOps" },
              ]
            });
          }

          if (req.url === "/api/codex/generate") {
            if (!hasNvidiaKey) {
              return sendResponse(500, { success: false, error: "NVIDIA API key not configured" });
            }
            // Execute real API call
            try {
              const fetchResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
                body: JSON.stringify({
                  model: "meta/llama-3.1-70b-instruct",
                  messages: [
                    { role: "system", content: "You are Codex. Generate code in ``` html block." },
                    { role: "user", content: body.prompt || "" }
                  ],
                  max_tokens: 1024
                })
              });
              const data = await fetchResponse.json();
              const content = data.choices?.[0]?.message?.content || "";
              const codeMatch = content.match(/```(html|js|python|json)?\n([\s\S]*?)```/);
              const code = codeMatch ? codeMatch[2].trim() : content;
              
              return sendResponse(200, {
                success: true,
                code: code,
                language: body.outputFormat || "html",
                description: "Vite Proxy Local Generation",
                previewUrl: body.outputFormat === "html" ? `data:text/html;charset=utf-8,${encodeURIComponent(code)}` : null,
                agent: "codex",
                backend: "nvidia-nim"
              });
            } catch (err) {
              return sendResponse(500, { success: false, error: err.message });
            }
          }

          if (req.url === "/api/asirem/speak") {
             if (!hasNvidiaKey) {
               return sendResponse(500, { 
                 success: false, 
                 error: "NVIDIA API key not configured", 
                 message: "ASiReM fallback: API key required for live inference. Configure NVIDIA_API_KEY in .env.local." 
               });
             }
             try {
                const fetchResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
                  body: JSON.stringify({
                    model: "meta/llama-3.1-70b-instruct",
                    messages: [
                      { role: "system", content: "You are ASiReM — Sovereign AI Orchestrator." },
                      { role: "user", content: body.message || "" }
                    ]
                  })
                });
                const data = await fetchResponse.json();
                return sendResponse(200, {
                  success: true,
                  message: data.choices?.[0]?.message?.content || "No response generated.",
                  agent: "asirem",
                  backend: "nvidia-nim"
                });
             } catch (err) {
               return sendResponse(502, { success: false, error: err.message, message: "ASiReM encountered an internal processing error." });
             }
          }

          next();
        });
      });
    }
  };
}
