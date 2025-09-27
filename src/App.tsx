import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import reactLogo from "./assets/react.svg";
import Test from "./Test";
import "./App.css";
import "@rainbow-me/rainbowkit/styles.css";

function Home() {
  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <div className="row">
        <Link
          to="/test"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007acc",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          Go to Test Route
        </Link>
      </div>
    </main>
  );
}

const config = getDefaultConfig({
  appName: "Conjurer",
  projectId: "YOUR_PROJECT_ID", // You can get this from https://cloud.walletconnect.com
  chains: [sepolia],
  ssr: false, // If your dApp uses server side rendering (SSR)
  wallets: [
    {
      groupName: "Recommended",
      wallets: [walletConnectWallet],
    },
  ],
});

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/test" element={<Test />} />
            </Routes>
          </Router>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
