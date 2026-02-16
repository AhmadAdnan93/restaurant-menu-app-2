#!/usr/bin/env node
/**
 * Deploy Restaurant Menu App to Vercel via API
 * 
 * 1. Create token at https://vercel.com/account/tokens
 * 2. Run: set VERCEL_TOKEN=your_token && node deploy-now.js
 *    Or: $env:VERCEL_TOKEN="your_token"; node deploy-now.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const fs = require('fs');
const path = require('path');
const tokenPath = path.join(__dirname, '.vercel-token');

let TOKEN = process.env.VERCEL_TOKEN;
if (!TOKEN && fs.existsSync(tokenPath)) {
  TOKEN = fs.readFileSync(tokenPath, 'utf8').trim();
}
const TEAM_ID = 'team_sjLZuhuseww7KjLC6JoprMfw';
const REPO = 'AhmadSulieman93/restaurant-menu-app';

if (!TOKEN) {
  console.log('\n⚠️  Missing token. Do ONE of these:\n');
  console.log('Option A - Create .vercel-token file:');
  console.log('  1. Open https://vercel.com/account/tokens');
  console.log('  2. Create token (scope: ahmadadnan93s-projects)');
  console.log('  3. Create file: .vercel-token with your token');
  console.log('  4. Run: node deploy-now.js\n');
  console.log('Option B - Use env var:');
  console.log('  $env:VERCEL_TOKEN="YOUR_TOKEN"; node deploy-now.js\n');
  process.exit(1);
}

async function api(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://api.vercel.com${endpoint}`);
    url.searchParams.set('teamId', TEAM_ID);
    
    const data = body ? JSON.stringify(body) : null;
    const req = https.request(url, {
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    }, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => {
        try {
          const j = buf ? JSON.parse(buf) : {};
          if (res.statusCode >= 400) reject(new Error(j.error?.message || buf || res.statusCode));
          else resolve(j);
        } catch (e) {
          reject(new Error(buf || e.message));
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Deploying to Vercel...\n');
  
  try {
    // Check if project exists
    let project;
    try {
      project = await api('GET', `/v9/projects/restaurant-menu-app`);
    } catch (e) {
      if (e.message?.includes('NOT_FOUND') || e.message?.includes('404')) {
        console.log('Creating project...');
        project = await api('POST', '/v10/projects', {
          name: 'restaurant-menu-app',
          framework: 'nextjs',
          gitRepository: { type: 'github', repo: REPO },
        });
      } else throw e;
    }

    console.log('Project:', project.name);
    
    // Create deployment from Git
    console.log('Creating deployment from GitHub...');
    const dep = await api('POST', '/v13/deployments', {
      name: 'restaurant-menu-app',
      project: project.name,
      target: 'production',
      gitSource: {
        type: 'github',
        repo: 'restaurant-menu-app',
        ref: 'main',
        org: 'AhmadSulieman93',
      },
    });

    const url = dep.url ? `https://${dep.url}` : dep.alias?.[0] || 'Check Vercel dashboard';
    console.log('\n✅ Deployment started!');
    console.log('URL:', url);
    console.log('\nBuild is running. Check status at: https://vercel.com/ahmadadnan93s-projects/restaurant-menu-app');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
