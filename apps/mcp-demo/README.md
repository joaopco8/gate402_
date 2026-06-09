# Metera MCP Demo

MCP server that exposes paywalled API tools via the x402 protocol on Solana devnet.

## Tools

| Tool | Description | Cost |
|---|---|---|
| `get_weather` | Weather data for a city | 0.001 USDC |
| `get_news` | Latest news headlines | 0.002 USDC |

## Setup

```bash
npm install
```

## Build

```bash
npm run build
# Output: dist/index.js
```

## Test in terminal

Make sure the Metera server is running first:
```bash
# In apps/server:
npm run dev
```

Then run the demo flow:
```bash
npm run test:client
```

This will:
1. Call `/api/weather` without payment → show the 402 response
2. Wait 1.5 seconds
3. Call `/api/weather` with `X-Payment-Payload` header → show the weather data
4. Print success and dashboard link

## Connect to Claude Desktop

### 1. Build the server

```bash
npm run build
```

### 2. Find your Claude Desktop config file

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```
Full path: `C:\Users\<YourUser>\AppData\Roaming\Claude\claude_desktop_config.json`

**Mac:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### 3. Add the MCP server config

Copy the contents of `claude-desktop-config.json` into your Claude Desktop config.

**Windows** (copy as-is from `claude-desktop-config.json`):
```json
{
  "mcpServers": {
    "metera-demo": {
      "command": "node",
      "args": ["C:\\Users\\Pichau\\Desktop\\gate402\\apps\\mcp-demo\\dist\\index.js"],
      "env": {
        "SERVER_URL": "http://localhost:3001"
      }
    }
  }
}
```

**Mac** (adjust the path):
```json
{
  "mcpServers": {
    "metera-demo": {
      "command": "node",
      "args": ["/Users/<YourUser>/Desktop/gate402/apps/mcp-demo/dist/index.js"],
      "env": {
        "SERVER_URL": "http://localhost:3001"
      }
    }
  }
}
```

### 4. Restart Claude Desktop

After saving the config, fully quit and reopen Claude Desktop. The tools `get_weather` and `get_news` will appear in the tool selector.

### 5. Make sure the Metera server is running

```bash
# In apps/server:
npm run dev
```

Then ask Claude:
> "Use get_weather to check the weather in Tokyo"
