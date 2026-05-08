import axios from 'axios';
import chalk from 'chalk';

const SERVER_URL = process.env.SERVER_URL ?? 'http://localhost:3001';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(chalk.bold.white('=== Gate402 MCP Demo ===\n'));

  // Step 1: Call /api/weather WITHOUT payment header → expect 402
  console.log(chalk.dim('Step 1: Calling /api/weather without payment header...'));
  try {
    const res = await axios.get(`${SERVER_URL}/api/weather`, {
      validateStatus: () => true,
    });

    if (res.status === 402) {
      console.log(chalk.red(`✗ HTTP 402 Payment Required`));
      console.log(chalk.red(`  Price: ${res.data.price?.amount} ${res.data.price?.currency} on ${res.data.price?.network}`));
      console.log(chalk.red(`  Pay to: ${res.data.payTo}`));
      console.log(chalk.red(`  ${res.data.instructions}\n`));
    } else {
      console.log(chalk.yellow(`  Unexpected status: ${res.status}\n`));
    }
  } catch (err) {
    console.log(chalk.red(`  Connection error — is the server running at ${SERVER_URL}?\n`));
    process.exit(1);
  }

  // Step 2: Wait 1.5 seconds
  console.log(chalk.dim('Step 2: Waiting 1.5 seconds...\n'));
  await sleep(1500);

  // Step 3: Call /api/weather WITH X-Payment-Payload header → expect 200
  console.log(chalk.dim('Step 3: Calling /api/weather with X-Payment-Payload header...'));
  try {
    const res = await axios.get(`${SERVER_URL}/api/weather`, {
      headers: { 'X-Payment-Payload': 'demo_test_payment' },
      validateStatus: () => true,
    });

    if (res.status === 200) {
      console.log(chalk.green(`✓ HTTP 200 OK`));
      console.log(chalk.green(`  City: ${res.data.city}`));
      console.log(chalk.green(`  Temperature: ${res.data.temp}`));
      console.log(chalk.green(`  Condition: ${res.data.condition}`));
      console.log(chalk.green(`  Humidity: ${res.data.humidity}\n`));
    } else if (res.status === 402) {
      console.log(chalk.yellow(`  Still 402 — payment verification failed: ${res.data.reason}\n`));
    } else {
      console.log(chalk.yellow(`  Status: ${res.status}\n`));
    }
  } catch (err) {
    console.log(chalk.red(`  Request error\n`));
  }

  // Step 4: Payment flow complete
  console.log(chalk.bold.green('✓ Payment flow complete!'));

  // Step 5: Dashboard link
  console.log(chalk.cyan('→ Check your dashboard at http://localhost:3000'));
}

main().catch(console.error);
