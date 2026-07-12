#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import axios from 'axios';
// Get GitHub token from environment
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
    console.error("GITHUB_TOKEN environment variable is required");
    process.exit(1);
}
const axiosInstance = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
    }
});
const server = new Server({
    name: "mcp-github",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    }
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_user",
                description: "Get the authenticated GitHub user details",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: []
                }
            },
            {
                name: "list_repos",
                description: "List the 10 most recently updated repositories for the authenticated user",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: []
                }
            }
        ]
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "get_user") {
        try {
            const response = await axiosInstance.get('/user');
            return {
                content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }]
            };
        }
        catch (e) {
            return {
                content: [{ type: "text", text: `Error fetching user: ${e.message}` }],
                isError: true,
            };
        }
    }
    else if (request.params.name === "list_repos") {
        try {
            const response = await axiosInstance.get('/user/repos?sort=updated&per_page=10');
            const repos = response.data.map((r) => ({ name: r.name, full_name: r.full_name, url: r.html_url }));
            return {
                content: [{ type: "text", text: JSON.stringify(repos, null, 2) }]
            };
        }
        catch (e) {
            return {
                content: [{ type: "text", text: `Error listing repos: ${e.message}` }],
                isError: true,
            };
        }
    }
    throw new Error(`Unknown tool: ${request.params.name}`);
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("GitHub MCP Server running on stdio");
}
main().catch(console.error);
