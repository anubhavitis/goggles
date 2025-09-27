interface UserInfoProps {
  userCredits: any;
  formattedPriceFor10Credits: string;
  creditPrice: any;
  onBuyCredits: () => void;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  isConnected: boolean;
}

export default function UserInfo({
  userCredits,
  formattedPriceFor10Credits,
  creditPrice,
  onBuyCredits,
  isPending,
  isConfirming,
  isSuccess,
  isError,
  isConnected,
}: UserInfoProps) {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-2">
      {/* Credits Display Card */}
      <div className="rounded-xl p-4 border border-emerald-400/30 dark:border-emerald-400/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600 mb-1">
              Your Credits
            </p>
            <p className="text-3xl font-bold text-emerald-600 ">
              {userCredits !== undefined && userCredits !== null
                ? userCredits.toString()
                : "0"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
        </div>
      </div>

      <BuyCreditsSection
        formattedPriceFor10Credits={formattedPriceFor10Credits}
        creditPrice={creditPrice}
        onBuyCredits={onBuyCredits}
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        isError={isError}
        isConnected={isConnected}
      />
    </div>
  );
}

function BuyCreditsSection({
  formattedPriceFor10Credits,
  creditPrice,
  onBuyCredits,
  isPending,
  isConfirming,
  isSuccess,
  isError,
  isConnected,
}: {
  formattedPriceFor10Credits: string;
  creditPrice: any;
  onBuyCredits: () => void;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  isConnected: boolean;
}) {
  return (
    <div className="flex">
      {/* Price Display */}
      <div className="rounded-xl w-full flex justify-center items-center p-2 border border-blue-400/20 border-r-0 rounded-r-none">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-white">
              10 Credits Package
            </span>
          </div>
          <div className="text-right pr-2">
            <p className="text-lg font-bold text-white">
              {formattedPriceFor10Credits !== "0"
                ? formattedPriceFor10Credits + " 0G"
                : "Loading..."}
            </p>
          </div>
        </div>
      </div>

      {/* Buy Button */}
      <button
        onClick={onBuyCredits}
        disabled={!isConnected || isPending || isConfirming || !creditPrice}
        className="w-fit group relative overflow-hidden bg-blue-600/80 hover:bg-blue-600
         disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white
          font-bold py-2 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 
          transform hover:scale-[1.02] hover:cursor-pointer active:scale-[0.98] disabled:transform-none rounded-l-none"
      >
        <div className="relative flex items-center justify-center gap-3">
          {isPending || isConfirming ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-lg">
                {isPending
                  ? "Confirming..."
                  : isConfirming
                  ? "Processing..."
                  : "Buying..."}
              </span>
            </>
          ) : isSuccess ? (
            <>
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-lg text-white">Credits Purchased!</span>
            </>
          ) : isError ? (
            <>
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="text-lg text-white">Transaction Failed</span>
            </>
          ) : (
            <>
              <span className="text-lg">Buy</span>
            </>
          )}
        </div>
      </button>

      {/* Status Messages */}
      {isSuccess && (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                Success!
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Your credits have been added to your account.
              </p>
            </div>
          </div>
        </div>
      )}

      {isError && (
        <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-400/30 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                Transaction Failed
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Please check your connection and try again.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
