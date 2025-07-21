"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, ZoomIn, ZoomOut, RotateCw, Download, Eye } from "lucide-react"

const FileViewer = ({ file, onClose }) => {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [pdfUrl, setPdfUrl] = useState(null)

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault()
    }

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault()
      }
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (file?.type === "document") {
      fetch(file.url)
        .then(response => response.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob)
          setPdfUrl(url)
          return () => URL.revokeObjectURL(url) // Cleanup on unmount
        })
        .catch(error => {
          console.error("Error fetching PDF:", error)
        })
    }
  }, [file?.url, file?.type])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 300))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleReset = () => {
    setZoom(100)
    setRotation(0)
  }

  console.log("FileViewer rendered with file:", file)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900 z-50 flex flex-col overflow-hidden"
    >
      <div className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-b border-gray-700 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-green-400" />
            <span className="text-white font-semibold">{file.title}</span>
          </div>
          <div className="text-gray-400 text-sm">
            {file.semester} • {file.subject} • {file.year}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomOut}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
              disabled={zoom <= 50}
            >
              <ZoomOut className="w-4 h-4" />
            </motion.button>

            <span className="text-gray-300 text-sm px-2 min-w-[60px] text-center">{zoom}%</span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomIn}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
              disabled={zoom >= 300}
            >
              <ZoomIn className="w-4 h-4" />
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRotate}
            className="p-2 bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-sm font-medium"
          >
            Reset
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, rotate: 0 }}
          animate={{ scale: zoom / 100, opacity: 1, rotate: rotation }}
          transition={{ duration: 0.3 }}
          className="max-w-[95vw] max-h-[95vh] w-full h-full flex items-center justify-center"
          style={{ transformOrigin: "center center" }}
        >
          {file?.type === "document" && pdfUrl ? (
            <iframe
              src={pdfUrl}
              title={file.title}
              className="w-full h-full border-0 rounded-none shadow-none bg-white"
              style={{ transformOrigin: "center center" }}
            />
          ) : file?.type === "document" ? (
            <div className="text-white text-center">Loading PDF...</div>
          ) : (
            <img
              src={file.url || "/placeholder.svg"}
              alt={file.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              style={{ userSelect: "none", pointerEvents: "none" }}
            />
          )}
        </motion.div>
      </div>

      <div className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-t border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-gray-400 text-sm">
            Use zoom and rotate controls to adjust the view. Right-click and downloads are disabled for security.
          </div>
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <Download className="w-4 h-4" />
            <span>Download Disabled</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default FileViewer