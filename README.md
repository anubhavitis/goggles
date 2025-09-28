# Goggles

A multi-component application with a macOS desktop app, Express.js backend, and smart contracts.

## Prerequisites

- **Node.js** (v18+)
- **Bun** - `curl -fsSL https://bun.sh/install | bash`
- **Rust** - `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **Tauri CLI** - `cargo install tauri-cli`


## Setup

```bash
git clone <repository-url>
cd goggles

# Install dependencies
bun install
cd backend && npm install && cd ..
cd smart-contract && npm install && cd ..
```

## Development

### Smart Contracts
```bash
cd smart-contract
npm run build && npm run deploy
```

### Backend API
```bash
cd backend
npm run dev  # Development mode
```

### Desktop App
```bash
bun run tauri dev
```

