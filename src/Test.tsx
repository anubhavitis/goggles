import { ConnectButton } from "@rainbow-me/rainbowkit";

function Test() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 text-white px-8 py-4 flex justify-between items-center border-b border-gray-700">
        <h1 className="m-0 text-2xl font-bold">Conjurer</h1>
        <div className="flex items-center gap-4">
          <ConnectButton
            label="Connect Wallet"
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
            chainStatus={{
              smallScreen: "icon",
              largeScreen: "full",
            }}
            showBalance={{
              smallScreen: false,
              largeScreen: true,
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-transparent text-gray-200">
        <div className="max-w-2xl mx-auto">
          <h2 className="mb-4 text-gray-100">Test Route</h2>
          <p className="mb-8 text-gray-400">
            Welcome to Conjurer - A magical file organizer.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Test;
