import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, useChainId, useSwitchChain } from "wagmi";
import { Chain } from "wagmi/chains";
import { walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import reactLogo from "./assets/react.svg";
import Info from "./Info";
import "./App.css";
import "@rainbow-me/rainbowkit/styles.css";
import { useEffect } from "react";

function Home() {
  const chainId = useChainId();
  const { switchChain, error } = useSwitchChain();

  useEffect(() => {
    if (chainId !== zeroGGalileoTestnetManual.id) {
      switchChain({ chainId: zeroGGalileoTestnetManual.id });
    }
  }, [chainId, error]);

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
          to="/info"
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

const zeroGGalileoTestnetManual = {
  id: 16602,
  name: "Galileo (Testnet)",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://evmrpc-testnet.0g.ai"] },
  },
  blockExplorers: {
    default: { name: "0G Explorer", url: "https://chainscan-galileo.0g.ai/" },
  },
} as const satisfies Chain;

const config = getDefaultConfig({
  appName: "Goggles",
  projectId: "YOUR_PROJECT_ID", // You can get this from https://cloud.walletconnect.com
  chains: [zeroGGalileoTestnetManual],
  ssr: false, // If your dApp uses server side rendering (SSR)
  wallets: [
    {
      groupName: "Recommended",
      wallets: [walletConnectWallet],
    },
  ],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 5, // 5 seconds
      gcTime: 1000 * 10, // 10 seconds
      refetchInterval: 5000, // 5 seconds
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/info" element={<Info />} />
            </Routes>
          </Router>
          <ReactQueryDevtools initialIsOpen={false} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
