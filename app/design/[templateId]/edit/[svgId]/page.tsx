"use client"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Download, Eye } from "lucide-react"
import { use, useEffect, useState } from "react"
import { SVGViewer } from "@/components/svg-viewer"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { customizeSvg } from "@/lib/svg-helpers"

export interface Template {
  uuid: string
  name: string
  description: string
  price: number
  catogery: string
  placeholderImage: string
  pdf: string
  svg: string
  created_at: string
  tags: string[]
}

type Props = {
  params: Promise<{ templateId: string; svgId: string }>
}

export default function SvgEditPage({ params }: Props) {
  const { templateId, svgId } = use(params)
  const router = useRouter()

  const [isDownloading, setIsDownloading] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [cardData, setCardData] = useState<Record<string, string>>({})
  const [template, setTemplate] = useState<Template>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [svgFileName, setSvgFileName] = useState<string>()
  const [originalSvgContent, setOriginalSvgContent] = useState<string>("")
  const [svgContent, setSvgContent] = useState<string>("")
  const [svgArray, setSvgArray] = useState<string[]>([])
  const [currentSvgIndex, setCurrentSvgIndex] = useState<number>(0)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<{
    type: "next" | "prev"
    svgId: string
  } | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English")

  // Fetch template info
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/design/${templateId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        })

        if (!res.ok) throw new Error("Failed to fetch template")
        const result = await res.json()
        const data = result.data
        if (!data?.uuid) throw new Error("Invalid template data")

        setTemplate(data)

        const parsedSvg = JSON.parse(data.svg)
        const svgKeys = Object.keys(parsedSvg)
        setSvgArray(svgKeys)

        // Validate if the current svgId exists in the SVG array
        if (!svgKeys.includes(svgId)) {
          throw new Error("SVG not found in template")
        }

        const fileName = parsedSvg[svgId]
        setSvgFileName(fileName)

        // Set current index
        const currentIndex = svgKeys.indexOf(svgId)
        setCurrentSvgIndex(currentIndex)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading template")
      } finally {
        setLoading(false)
      }
    }

    if (templateId && svgId) fetchTemplate()
  }, [templateId, svgId])

  // Fetch SVG props and initialize dynamic state
  useEffect(() => {
    if (svgFileName) {
      const fetchSvgProps = async () => {
        try {
          const res = await fetch(`/api/getSvg/props?filename=${svgFileName}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          })

          const data = await res.json()
          console.log("SVG Placeholders:", data.data)

          if (data.success && data.data.placeholders) {
            // Create dynamic state object with empty values
            const dynamicState: Record<string, string> = {}
            data.data.placeholders.forEach((placeholder: string) => {
              dynamicState[placeholder] = ""
            })

            setCardData(dynamicState)
          }
        } catch (error) {
          console.error("Error fetching SVG props:", error)
        }
      }

      fetchSvgProps()
    }
  }, [svgFileName])

  // Fetch actual SVG file from your backend
  useEffect(() => {
    if (!svgFileName) return

    const fetchSvg = async () => {
      try {
        const res = await fetch(`/api/getSvg/${svgFileName}`)
        if (!res.ok) throw new Error("Failed to load SVG file")

        const svgText = await res.text()

        setSvgContent(svgText)
        setOriginalSvgContent(svgText)
      } catch (err) {
        console.error(err)
        setSvgContent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
          <text x="10" y="100" fill="red">Error loading SVG</text>
        </svg>`)
      }
    }

    fetchSvg()
  }, [svgFileName])

  const handleInputChange = (field: string, value: string) => {
    setCardData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value)
  }

  const handlePreview = async () => {
    try {
      setPreviewing(true)
      console.log("Original SVG content length:", svgContent.length)

      const userEdits = cardData
      const userEditsKeys = Object.keys(userEdits).map((key) => key.toUpperCase().replace(/\s+/g, "_"))
      const userEditsValues = Object.values(userEdits)
      const userEditsObj = userEditsKeys.reduce(
        (acc, key, index) => {
          acc[key] = userEditsValues[index]
          return acc
        },
        {} as Record<string, string>,
      )

      console.log("User edits:", userEditsObj)

      // Check what customizeSvg returns
      const newSvg = await customizeSvg(originalSvgContent, userEditsObj)
      console.log("New SVG content length:", newSvg.length)
      console.log("New SVG content (first 200 chars):", newSvg.substring(0, 200))

      setSvgContent(newSvg)
      console.log("SVG content updated in state")
    } catch (err) {
      console.error("Preview error:", err)
      toast.info("Failed to preview card. Please try again.")
    } finally {
      setPreviewing(false)
    }
  }

  const handleDownload = async () => {
    try {
      setIsDownloading(true)

      // Format the data as required: uppercase and replace spaces with underscores
      const formattedData: Record<string, string> = {}

      Object.entries(cardData).forEach(([key, value]) => {
        const formattedKey = key.toUpperCase().replace(/\s+/g, "_")
        formattedData[formattedKey] = value
      })

      console.log("Sending data:", formattedData)

      // Convert data to URL search params
      const searchParams = new URLSearchParams()
      Object.entries(formattedData).forEach(([key, value]) => {
        searchParams.append(key, value)
      })

      const queryString = searchParams.toString()
      const url = `/api/design/${templateId}/edit/${svgId}${queryString ? `?${queryString}` : ""}`

      console.log("Request URL:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`)
      }

      // Get the response with temporary download link
      const result = await response.json()
      console.log("API Response:", result)

      // Check if we have a download URL in the response
      if (result.downloadUrl) {
        // Create a temporary anchor element to trigger download
        const downloadLink = document.createElement("a")
        downloadLink.href = result.downloadUrl
        downloadLink.download = `card-design-${templateId}-${svgId}.svg`
        downloadLink.target = "_blank" // Open in new tab for safety
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)

        alert("Card downloaded successfully!")
      } else if (result.message) {
        // If there's a message but no download URL
        alert(result.message)
      } else {
        throw new Error("No download URL received from server")
      }
    } catch (error) {
      console.error("Download error:", error)
      toast.info("Failed to download card. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const navigateToNextSvg = () => {
    if (currentSvgIndex < svgArray.length - 1) {
      const nextSvgId = svgArray[currentSvgIndex + 1]
      setPendingNavigation({ type: "next", svgId: nextSvgId })
      setShowDownloadDialog(true)
    }
  }

  const navigateToPrevSvg = () => {
    if (currentSvgIndex > 0) {
      const prevSvgId = svgArray[currentSvgIndex - 1]
      setPendingNavigation({ type: "prev", svgId: prevSvgId })
      setShowDownloadDialog(true)
    }
  }

  const handleDownloadAndNavigate = async () => {
    try {
      // Trigger download first
      await handleDownload()

      // Then navigate to the pending route
      if (pendingNavigation) {
        router.push(`/design/${templateId}/edit/${pendingNavigation.svgId}`)
      }

      setShowDownloadDialog(false)
      setPendingNavigation(null)
    } catch (error) {
      console.error("Error during download and navigate:", error)
    }
  }

  const handleContinueWithoutDownload = () => {
    // Navigate without downloading
    if (pendingNavigation) {
      router.push(`/design/${templateId}/edit/${pendingNavigation.svgId}`)
    }

    setShowDownloadDialog(false)
    setPendingNavigation(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <h1 className="text-2xl font-semibold">Loading...</h1>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <Link href="/my-template" className="text-purple-600 hover:text-purple-700 underline">
            Back to Templates
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Download Confirmation Dialog */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Your Design</DialogTitle>
            <DialogDescription>
              Your current design changes will not be saved when you navigate to another template. We recommend
              downloading your design before proceeding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:gap-2">
            <Button
              onClick={handleDownloadAndNavigate}
              className="w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={16} />
              Download & Continue
            </Button>
            <Button
              onClick={handleContinueWithoutDownload}
              variant="outline"
              className="w-full sm:w-auto bg-transparent"
            >
              Continue Without Download
            </Button>
            <Button onClick={() => setShowDownloadDialog(false)} variant="ghost" className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <main className="mb-4 sm:mb-8">
          <div className="min-h-screen bg-background text-foreground font-sans">
            {/* Header */}
            <header className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 border-b">
              <div className="w-full sm:w-auto">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold wrap-break-word">Edit Invitation</h1>
                <CardDescription className="text-xs sm:text-sm mt-1 wrap-break-word">
                  Template ID: {templateId} • Customize your {template?.catogery.toLowerCase()} card
                </CardDescription>
              </div>

              {/* Navigation Arrows - Top */}
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                <Button
                  onClick={navigateToPrevSvg}
                  disabled={currentSvgIndex === 0}
                  variant="outline"
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10 bg-transparent"
                >
                  <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Previous</span>
                  <span className="xs:hidden">Prev</span>
                </Button>

                <Badge
                  variant="secondary"
                  className="min-w-[70px] sm:min-w-[100px] text-center text-xs sm:text-sm px-2 sm:px-3"
                >
                  {currentSvgIndex + 1} of {svgArray.length}
                </Badge>

                <Button
                  onClick={navigateToNextSvg}
                  disabled={currentSvgIndex === svgArray.length - 1}
                  variant="outline"
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10 bg-transparent"
                >
                  <span className="hidden xs:inline">Next</span>
                  <span className="xs:hidden">Next</span>
                  <ChevronRight size={16} className="sm:w-5 sm:h-5" />
                </Button>
              </div>
            </header>

            {/* Layout */}
            <main className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Editor */}
              <Card className="md:sticky md:top-20 md:max-h-[calc(100vh-120px)] overflow-y-auto w-full">
                <CardHeader className="p-4 sm:p-6">
                  {/* Title + Dropdown side-by-side */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <CardTitle className="text-lg sm:text-xl">Edit Card Details</CardTitle>

                    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-full sm:w-[180px] border-2 border-zinc-500">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Select Language</SelectLabel>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Hindi">Hindi</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4">
                    {Object.entries(cardData).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium capitalize wrap-break-word">
                          {key.replace(/([A-Z])/g, " $1")}
                        </label>
                        <Input
                          value={value}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          placeholder={`Enter ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                          className="w-full"
                        />

                        {/* Language Preview */}
                        {value && (
                          <div className="p-2 bg-muted rounded-md border wrap-break-word">
                            <div className="text-xs text-muted-foreground mb-1">{selectedLanguage} Preview:</div>
                            <div
                              className={`text-sm wrap-break-word ${
                                selectedLanguage === "Hindi" ? "mangal-regular" : "font-roboto"
                              }`}
                              style={{
                                fontFamily: selectedLanguage === "Hindi" ? "" : "Roboto, sans-serif",
                              }}
                            >
                              {value}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-3 w-full">
                      <Button
                        onClick={handlePreview}
                        disabled={previewing}
                        className="flex-1 w-full flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Eye size={16} /> {!previewing ? <>Preview</> : <>Previewing....</>}
                      </Button>
                      <Button
                        onClick={handleDownload}
                        variant="outline"
                        className="flex-1 w-full flex items-center justify-center gap-2 cursor-pointer bg-transparent"
                        disabled={isDownloading}
                      >
                        <Download size={16} />
                        {isDownloading ? "Downloading..." : "Download"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Preview */}
              <Card className="w-full">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Live Preview</CardTitle>
                  <CardDescription className="text-xs sm:text-sm wrap-break-word">
                    Real-time preview of your invitation card
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6">
                  <div className="w-full max-w-full sm:max-w-[600px] mx-auto overflow-hidden">
                    <SVGViewer svgContent={svgContent} title="Invitation Preview" />
                  </div>

                  <Alert className="w-full mt-4 sm:mt-6">
                    <AlertDescription className="flex items-start sm:items-center gap-2 text-xs sm:text-sm wrap-break-word">
                      <span className="shrink-0">💡</span>
                      <span>
                        <strong>Tip:</strong> Edits update instantly in the preview. Use arrows to navigate between
                        designs.
                      </span>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </main>
          </div>
        </main>
      </div>
    </div>
  )
}
