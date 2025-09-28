import WindowControls from "./WindowControls";
import WalletConnect from "./WalletConnect";

export default function Header() {
  return (
    <header className="bg-transparent backdrop-blur-xl px-8 py-4 flex justify-between items-center border-b border-gray-200/20 dark:border-gray-700/30">
      <div className="flex items-center gap-4">
        <WindowControls />
        <h1 className="text-2xl font-semibold text-gray-400 dark:text-white">
          goggles
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <WalletConnect />
      </div>
    </header>
  );
}
