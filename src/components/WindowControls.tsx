import { invoke } from "@tauri-apps/api/core";

export default function WindowControls() {
  const handleClose = async () => {
    try {
      await invoke("close_window");
    } catch (error) {
      console.error("Failed to close window:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClose}
        className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-200 shadow-sm"
        title="Close"
      >
        <span className="sr-only">Close</span>
      </button>
      <button
        onClick={handleClose}
        className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors duration-200 shadow-sm"
        title="Minimize"
      >
        <span className="sr-only">Minimize</span>
      </button>
      <button
        onClick={handleClose}
        className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors duration-200 shadow-sm"
        title="Maximize"
      >
        <span className="sr-only">Maximize</span>
      </button>
    </div>
  );
}
