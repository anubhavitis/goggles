import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { ScanTextIcon } from "./ui/scan-text";
import { useState } from "react";

interface FinderSelectionProps {
  className?: string;
}

export default function FinderSelection({
  className = "",
}: FinderSelectionProps) {
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(
    new Set()
  );
  const [processedFiles, setProcessedFiles] = useState<Set<string>>(new Set());
  const [errorFiles, setErrorFiles] = useState<Set<string>>(new Set());

  const {
    data: selectedPaths = [],
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["finder-selection"],
    queryFn: async () => {
      return await invoke<string[]>("get_finder_selection");
    },
    refetchInterval: 1000, // Refresh every 1 second
    refetchIntervalInBackground: true,
    staleTime: 500, // Consider data stale after 500ms
    gcTime: 2000, // Keep in cache for 2 seconds
  });

  const handleProcessImage = async (filePath: string) => {
    setProcessingFiles((prev) => new Set(prev).add(filePath));
    setErrorFiles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(filePath);
      return newSet;
    });

    try {
      await invoke<string>("process_image_with_ai", { filePath });
      setProcessedFiles((prev) => new Set(prev).add(filePath));
    } catch (error) {
      console.error("Failed to process image:", error);
      setErrorFiles((prev) => new Set(prev).add(filePath));
    } finally {
      setProcessingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(filePath);
        return newSet;
      });
    }
  };

  return (
    <div
      className={`bg-gradient-to-br from-white/15 to-white/5 dark:from-white/8 dark:to-white/3 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/10 dark:shadow-black/30 transition-all duration-300 hover:shadow-3xl hover:shadow-black/15 dark:hover:shadow-black/40 hover:-translate-y-0.5 ${className}`}
    >
      {isError && (
        <div className="mb-4 p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-400/30 rounded-xl">
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
                Error
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {error instanceof Error ? error.message : String(error)}
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedPaths.length > 0 ? (
        <div className="space-y-2">
          <div className="max-h-60 overflow-y-auto space-y-1.5">
            {selectedPaths.map((path, index) => {
              const fileName = path.split("/").pop() || path;
              const filePath = path.replace(fileName, "").slice(0, -1);

              return (
                <div
                  key={index}
                  className="px-3 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-lg
                   group backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {fileName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {filePath}
                      </p>
                    </div>
                    <button
                      onClick={() => handleProcessImage(path)}
                      disabled={processingFiles.has(path)}
                      className={`p-1.5 rounded-md transition-colors ${
                        processingFiles.has(path)
                          ? "bg-yellow-500/20 text-yellow-600 cursor-not-allowed"
                          : processedFiles.has(path)
                          ? "bg-green-500/20 text-green-600 hover:bg-green-500/30"
                          : errorFiles.has(path)
                          ? "bg-red-500/20 text-red-600 hover:bg-red-500/30"
                          : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:cursor-pointer"
                      }`}
                      title={
                        processingFiles.has(path)
                          ? "Processing..."
                          : processedFiles.has(path)
                          ? "Processed successfully"
                          : errorFiles.has(path)
                          ? "Processing failed - Click to retry"
                          : "Process image with AI"
                      }
                    >
                      {processingFiles.has(path) ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : processedFiles.has(path) ? (
                        <svg
                          className="w-4 h-4"
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
                      ) : errorFiles.has(path) ? (
                        <svg
                          className="w-4 h-4"
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
                      ) : (
                        <ScanTextIcon />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : !isLoading && !error ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Select files in Finder to see them appear here automatically
          </p>
        </div>
      ) : null}
    </div>
  );
}
