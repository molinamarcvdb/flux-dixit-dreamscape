// vite.config.ts
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { handleGenerateImageRequest } from './src/server/generateImageHandler'; // Adjust path if needed
import { IncomingMessage, ServerResponse } from 'http'; // Import Node types
import { Readable } from 'stream'; // Import Node stream type

// Helper function to convert Node request to Fetch API Request
async function nodeRequestToFetchRequest(req: IncomingMessage): Promise<Request> {
    const url = `http://${req.headers.host}${req.url}`;
    const method = req.method || 'GET';
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
        if (value !== undefined) {
            headers.append(key, Array.isArray(value) ? value.join(', ') : value);
        }
    }

    let body: ReadableStream<Uint8Array> | null = null;
    if (method !== 'GET' && method !== 'HEAD') {
        // Convert Node stream to Web stream
        const nodeStream = req as Readable;
        body = new ReadableStream({
            start(controller) {
                nodeStream.on('data', (chunk) => controller.enqueue(chunk));
                nodeStream.on('end', () => controller.close());
                nodeStream.on('error', (err) => controller.error(err));
            }
        });
    }

    return new Request(url, { method, headers, body });
}


// Custom Vite Plugin for Local API
const localApiPlugin = (): Plugin => {
    const apiEndpoint = process.env.VITE_HF_API_ENDPOINT || '/api/generate-image';
    return {
        name: 'local-api-plugin',
        configureServer(server) {
            server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: Function) => {
                if (req.url?.startsWith(apiEndpoint)) {
                    try {
                        // Convert Node req to Fetch API Request
                        const fetchRequest = await nodeRequestToFetchRequest(req);
                        // Call your handler
                        const response = await handleGenerateImageRequest(fetchRequest);

                        // Send the response back
                        res.statusCode = response.status;
                        response.headers.forEach((value, key) => {
                            res.setHeader(key, value);
                        });
                        // Pipe the response body (if any)
                        if (response.body) {
                            for await (const chunk of response.body) {
                                res.write(chunk);
                            }
                        }
                        res.end();
                    } catch (error) {
                       console.error(`Error processing ${apiEndpoint}:`, error);
                       res.statusCode = 500;
                       res.setHeader('Content-Type', 'application/json');
                       res.end(JSON.stringify({ error: 'Internal Server Error' }));
                    }
                } else {
                    // If the URL doesn't match, pass to the next middleware
                    next();
                }
            });
        },
    };
};


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), localApiPlugin()], // Add the custom plugin here
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 8080, // Ensure your port is specified if not default 5173
        // Proxy might be needed if you run a *separate* backend, but not for middleware
        // proxy: {
        //   '/api': 'http://localhost:3001' // Example if using separate server
        // }
    }
});
