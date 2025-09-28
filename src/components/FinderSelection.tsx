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
      className={`bg-white border border-black rounded-3xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${className}`}
    >
      {isError && (
        <div className="mb-4 p-4 bg-gray-100 border border-black rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-black"
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
              <p className="text-sm font-semibold text-black">Error</p>
              <p className="text-xs text-gray-600">
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
                  className="px-3 py-2 bg-white border border-black rounded-lg hover:bg-gray-100 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-black truncate">
                        {fileName}
                      </h4>
                      <p className="text-xs text-gray-600 truncate">
                        {filePath}
                      </p>
                    </div>
                    <button
                      onClick={() => handleProcessImage(path)}
                      disabled={processingFiles.has(path)}
                      className={`p-1.5 rounded-md transition-colors ${
                        processingFiles.has(path)
                          ? "bg-gray-300 text-black cursor-not-allowed"
                          : processedFiles.has(path)
                          ? "bg-gray-200 text-black hover:bg-gray-300"
                          : errorFiles.has(path)
                          ? "bg-gray-200 text-black hover:bg-gray-300"
                          : "bg-gray-200 hover:bg-gray-300 text-black hover:cursor-pointer"
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
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-600"
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
          <p className="text-gray-600 text-sm">
            Select files in Finder to see them appear here automatically
          </p>
        </div>
      ) : null}
    </div>
  );
}
