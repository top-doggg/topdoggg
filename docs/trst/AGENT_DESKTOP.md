# vercel-labs/agent-desktop — separate workstation integration

Upstream: https://github.com/vercel-labs/agent-desktop (Apache-2.0). Verified as a desktop OS accessibility automation CLI/MCP server. It is not a Vercel deployment and does not run a macOS/Windows desktop inside ordinary Vercel serverless functions.

On a machine the user controls:
```bash
gh repo clone vercel-labs/agent-desktop
npm install -g agent-desktop
agent-desktop status
agent-desktop permissions --guide
agent-desktop skills get desktop
agent-desktop skills get platform
```

Use `agent-desktop snapshot --app <App> -i`, then act on a full ref from that snapshot, then snapshot again to verify. Windows PowerShell: quote `'@snapshot:ref'` values.

Optional local MCP config:
```json
{"mcpServers":{"agent-desktop":{"command":"agent-desktop","args":["mcp"]}}}
```

Only a desktop-running agent with the program installed and OS permissions can use it; do not assume a remotely hosted Codex Cloud task can see the user's local desktop. Grant minimum OS permissions, keep accessibility snapshots/clipboard private, never connect unrestricted remote access or publish logs. Use Vercel/GitHub integrations for hosted website work.
