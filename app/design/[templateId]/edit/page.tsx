"use client";

import { useState } from "react";
import { Download, Save } from "lucide-react";
import { useTheme } from "next-themes";

export default function TemplateEditor() {
  const [cardData, setCardData] = useState({
    recipientName: "Guest Name",
    senderName: "Your Name",
    senderAddress: "123 Main Street, City, State 12345",
    eventDate: "2024-06-15",
    eventTime: "6:00 PM",
    eventLocation: "Grand Ballroom",
    customMessage: "We would be honored by your presence",
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, setTheme } = useTheme();

  const handleInputChange = (field: keyof typeof cardData, value: string) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => alert("Card design saved successfully!");
  const handleDownload = () => alert("Preparing your card for download...");

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-black text-gray-800 dark:text-gray-200 font-[Geist]">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Invitation
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Template ID: 001 • Customize your invitation card
          </p>
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sidebar / Editor */}
        <section className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Edit Card Details
          </h2>

          <div className="flex flex-col gap-4">
            {Object.entries(cardData).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1 capitalize text-gray-700 dark:text-gray-300">
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
                {key === "customMessage" ? (
                  <textarea
                    value={value}
                    onChange={(e) =>
                      handleInputChange(key as keyof typeof cardData, e.target.value)
                    }
                    rows={3}
                    className="w-full rounded-md bg-white dark:bg-neutral-950 border border-gray-300 dark:border-gray-700 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-gray-100 resize-none"
                  />
                ) : (
                  <input
                    type={key.includes("Date") ? "date" : "text"}
                    value={value}
                    onChange={(e) =>
                      handleInputChange(key as keyof typeof cardData, e.target.value)
                    }
                    className="w-full rounded-md bg-white dark:bg-neutral-950 border border-gray-300 dark:border-gray-700 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-gray-100"
                  />
                )}
              </div>
            ))}

            {/* Buttons */}
            <div className="flex gap-3 pt-3">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md py-2 font-medium transition"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-md py-2 font-medium transition"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        </section>

        {/* Live Preview */}
        <section className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-8 flex flex-col items-center justify-center">
          <div className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 rounded-lg text-center">
            <h1 className="text-3xl font-bold mb-4 text-purple-600 dark:text-purple-400 tracking-wide uppercase">
              ✨ Invitation ✨
            </h1>
            <p className="text-xl font-semibold mb-4">
              Dear {cardData.recipientName},
            </p>
            <p className="italic text-gray-600 dark:text-gray-300 mb-4">
              {cardData.customMessage}
            </p>
            <div className="text-sm text-gray-700 dark:text-gray-400 leading-6">
              <p>
                <strong>Date:</strong>{" "}
                {new Date(cardData.eventDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {cardData.eventTime}
              </p>
              <p>
                <strong>Location:</strong> {cardData.eventLocation}
              </p>
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                With warm regards,
              </p>
              <p className="text-lg font-bold text-purple-500 dark:text-purple-300">
                {cardData.senderName}
              </p>
              <p className="text-xs text-gray-500 mt-1">{cardData.senderAddress}</p>
            </div>
          </div>

          {/* Tip box */}
          <div className="w-full mt-6 bg-gray-100 dark:bg-neutral-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
            💡 <strong>Tip:</strong> Edits update instantly in the preview.
          </div>
        </section>
      </main>
    </div>
  );
}
