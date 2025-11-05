"use client"

import { useState } from "react"
import { Download, Save } from "lucide-react"



interface Template {
  uuid: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  preview_url: string | null;
  editable_fields: Array<{
    label: string;
    type: string;
    required: boolean;
  }>;
  rating: number;
  downloads: number;
  created_at: string;
  tags: string[];
}


export default function TemplateEditor() {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [template, setTemplate] = useState<Template | null>(null);

  const [cardData, setCardData] = useState({
    recipientName: "Guest Name",
    senderName: "Your Name",
    senderAddress: "123 Main Street, City, State 12345",
    eventDate: "2024-06-15",
    eventTime: "6:00 PM",
    eventLocation: "Grand Ballroom",
    customMessage: "We would be honored by your presence",
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleInputChange = (field: keyof typeof cardData, value: string) => {
    setCardData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    console.log("Saving card:", cardData)
    alert("Card design saved successfully!")
  }

  const handleDownload = () => {
    console.log("Downloading card:", cardData)
    alert("Your invitation card is being prepared for download...")
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "'Geist', sans-serif" }}>

      {/* Main Content */}
      <main style={{ padding: "2rem 1.5rem", maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "30px",
              fontWeight: "bold",
              marginBottom: "0.5rem",
              color: "#1f2937",
            }}
          >
            Edit {}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Template ID: 001 • Customize your invitation card design</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: sidebarOpen ? "repeat(auto-fit, minmax(300px, 1fr))" : "1fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* Editor Panel - Sidebar */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              position: "sticky",
              top: "100px",
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "1.5rem",
                color: "#1f2937",
              }}
            >
              Edit Card Details
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Recipient Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "0.5rem",
                    color: "#1f2937",
                  }}
                >
                  Recipient Name
                </label>
                <input
                  type="text"
                  placeholder="Enter guest name"
                  value={cardData.recipientName}
                  onChange={(e) => handleInputChange("recipientName", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "'Geist', sans-serif",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Sender Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "0.5rem",
                    color: "#1f2937",
                  }}
                >
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={cardData.senderName}
                  onChange={(e) => handleInputChange("senderName", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "'Geist', sans-serif",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Sender Address */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "0.5rem",
                    color: "#1f2937",
                  }}
                >
                  Your Address
                </label>
                <input
                  type="text"
                  placeholder="Your address"
                  value={cardData.senderAddress}
                  onChange={(e) => handleInputChange("senderAddress", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "'Geist', sans-serif",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Event Date */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "0.5rem",
                    color: "#1f2937",
                  }}
                >
                  Event Date
                </label>
                <input
                  type="date"
                  value={cardData.eventDate}
                  onChange={(e) => handleInputChange("eventDate", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "'Geist', sans-serif",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Event Time */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "0.5rem",
                    color: "#1f2937",
                  }}
                >
                  Event Time
                </label>
                <input
                  type="text"
                  placeholder="e.g., 6:00 PM"
                  value={cardData.eventTime}
                  onChange={(e) => handleInputChange("eventTime", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "'Geist', sans-serif",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Event Location */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "0.5rem",
                    color: "#1f2937",
                  }}
                >
                  Event Location
                </label>
                <input
                  type="text"
                  placeholder="Venue or address"
                  value={cardData.eventLocation}
                  onChange={(e) => handleInputChange("eventLocation", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "'Geist', sans-serif",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Custom Message */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "0.5rem",
                    color: "#1f2937",
                  }}
                >
                  Custom Message
                </label>
                <textarea
                  placeholder="Add a custom message"
                  value={cardData.customMessage}
                  onChange={(e) => handleInputChange("customMessage", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "'Geist', sans-serif",
                    boxSizing: "border-box",
                    resize: "none",
                    height: "80px",
                  }}
                />
              </div>
              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "0.5rem", paddingTop: "1rem" }}>
                <button
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    padding: "0.625rem",
                    backgroundColor: "#6366f1",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Save size={16} />
                  Save
                </button>
                <button
                  onClick={handleDownload}
                  style={{
                    flex: 1,
                    padding: "0.625rem",
                    backgroundColor: "#f3f4f6",
                    color: "#1f2937",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                borderRadius: "8px",
                padding: "3rem",
                minHeight: "600px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  border: "4px dashed #d1d5db",
                  padding: "2rem",
                  textAlign: "center",
                  width: "100%",
                  fontSize: "16px",
                  lineHeight: "1.6",
                }}
              >
                {/* Card Header */}
                <h1
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    marginBottom: "1.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  ✨ Invitation ✨
                </h1>

                {/* Main Content */}
                <div style={{ margin: "2rem 0", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div>
                    <p
                      style={{
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Dear
                    </p>
                    <p
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                      }}
                    >
                      {cardData.recipientName}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: "1.5rem",
                    }}
                  >
                    <p
                      style={{
                        fontStyle: "italic",
                        fontSize: "18px",
                        marginBottom: "1rem",
                      }}
                    >
                      {cardData.customMessage}
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "14px" }}>
                    <p>
                      <span style={{ fontWeight: "bold" }}>Date:</span>{" "}
                      {new Date(cardData.eventDate).toLocaleDateString()}
                    </p>
                    <p>
                      <span style={{ fontWeight: "bold" }}>Time:</span> {cardData.eventTime}
                    </p>
                    <p>
                      <span style={{ fontWeight: "bold" }}>Location:</span> {cardData.eventLocation}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div
                  style={{
                    marginTop: "2rem",
                    paddingTop: "1.5rem",
                  }}
                >
                  <p style={{ fontSize: "14px", marginBottom: "0.5rem" }}>With warm regards,</p>
                  <p style={{ fontSize: "20px", fontWeight: "bold" }}>{cardData.senderName}</p>
                  <p style={{ fontSize: "12px", marginTop: "1rem" }}>{cardData.senderAddress}</p>
                </div>
              </div>
            </div>

            {/* Preview Info */}
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                backgroundColor: "#f0f4ff",
                borderRadius: "8px",
                border: "1px solid #dbeafe",
              }}
            >
              <p style={{ fontSize: "14px", color: "#374151" }}>
                💡 <strong>Tip:</strong> The preview shows how your invitation card will look. Make changes in the
                editor panel to see updates in real-time.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}