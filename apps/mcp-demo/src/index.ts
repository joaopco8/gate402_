import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import axios from 'axios';

const SERVER_URL = process.env.SERVER_URL ?? 'http://localhost:3001';

const server = new McpServer({
  name: 'gate402-demo',
  version: '1.0.0',
});

// @ts-ignore — TS2589: MCP SDK + zod deep type instantiation false positive
server.tool(
  'get_weather',
  'Get weather data for a city. Costs 0.001 USDC per call via x402.',
  { city: z.string().describe('City name') },
  async ({ city }) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/weather`, {
        headers: { 'X-Payment-Payload': 'demo_hackathon_payment' },
        params: { city },
        validateStatus: () => true,
      });

      if (response.status === 402) {
        const data = response.data;
        return {
          content: [{
            type: 'text' as const,
            text: [
              `⚠️  Payment Required (HTTP 402)`,
              ``,
              `This endpoint costs ${data.price?.amount} ${data.price?.currency} on ${data.price?.network}.`,
              `Send payment to: ${data.payTo}`,
              `Then retry with your tx hash in the X-Payment-Payload header.`,
              ``,
              `Instructions: ${data.instructions}`,
            ].join('\n'),
          }],
        };
      }

      const w = response.data;
      return {
        content: [{
          type: 'text' as const,
          text: `Weather data for ${city}:\nTemperature: ${w.temp}\nCondition: ${w.condition}\nHumidity: ${w.humidity}`,
        }],
      };
    } catch {
      return { content: [{ type: 'text' as const, text: 'Error connecting to Gate402 server.' }] };
    }
  }
);

// @ts-ignore — TS2589: MCP SDK + zod deep type instantiation false positive
server.tool(
  'get_news',
  'Get latest news. Costs 0.002 USDC per call via x402.',
  { topic: z.string().describe('News topic') },
  async ({ topic }) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/news`, {
        headers: { 'X-Payment-Payload': 'demo_hackathon_payment' },
        params: { topic },
        validateStatus: () => true,
      });

      if (response.status === 402) {
        const data = response.data;
        return {
          content: [{
            type: 'text' as const,
            text: [
              `⚠️  Payment Required (HTTP 402)`,
              ``,
              `This endpoint costs ${data.price?.amount} ${data.price?.currency} on ${data.price?.network}.`,
              `Send payment to: ${data.payTo}`,
              `Then retry with your tx hash in the X-Payment-Payload header.`,
              ``,
              `Instructions: ${data.instructions}`,
            ].join('\n'),
          }],
        };
      }

      const n = response.data;
      return {
        content: [{
          type: 'text' as const,
          text: `Latest news (topic: ${topic}):\nHeadline: ${n.headline}\nSource: ${n.source}\nPublished: ${n.timestamp}`,
        }],
      };
    } catch {
      return { content: [{ type: 'text' as const, text: 'Error connecting to Gate402 server.' }] };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Gate402 MCP server running on stdio');
}

main().catch(console.error);
