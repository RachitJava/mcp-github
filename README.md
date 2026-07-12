# MCP GitHub Navigator

A Model Context Protocol (MCP) server that provides an AI agent with secure access to GitHub data, allowing it to list repositories, view issues, and read files via the GitHub API.

## HLD (High-Level Design)
- **Architecture**: The server is built in Node.js/TypeScript and implements the standard MCP `@modelcontextprotocol/sdk`. It uses a StdioServerTransport to communicate directly with any MCP-compatible AI client via standard input/output.
- **External Integration**: Uses Axios to connect to the GitHub REST API (`https://api.github.com`).
- **Authentication**: Relies on a Personal Access Token provided via the `GITHUB_TOKEN` environment variable.

## LLD (Low-Level Design)
- **Entry Point**: `src/index.ts` is the main entry point which initializes the `Server` instance and maps MCP capabilities.
- **Tools Registered**:
  - `get_user`: Uses `GET /user` to return the authenticated GitHub profile.
  - `list_repos`: Uses `GET /user/repos?sort=updated&per_page=10` to return recently active repositories.
- **Data Flow**: When an AI client sends a `CallToolRequestSchema` for `list_repos`, the MCP server validates the tool name, invokes the corresponding GitHub API endpoint via Axios, formats the JSON response into a text block, and returns it to the client.

## TDD (Test-Driven Development) Strategy
- **Frameworks**: We recommend using `Jest` for executing test suites.
- **Mocking**: Testing relies on mocking the `axiosInstance` using libraries like `nock` or `axios-mock-adapter` to simulate GitHub API responses without requiring an active internet connection or hitting API rate limits.
- **Integration Tests**: Creating a mock MCP Client using `@modelcontextprotocol/sdk/client` to test the end-to-end flow of standard `CallTool` requests.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- A GitHub Personal Access Token (PAT)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/RachitJava/mcp-github.git
   cd mcp-github
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

### Running the Server
The server requires the `GITHUB_TOKEN` environment variable to be set. You can run it directly:
```bash
export GITHUB_TOKEN="your_personal_access_token_here"
npm start
```

*Note: Since this is an MCP server, it is meant to be run by an MCP client (like Claude Desktop) rather than manually.*
