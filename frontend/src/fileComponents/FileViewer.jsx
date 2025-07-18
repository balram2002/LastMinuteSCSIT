"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, ZoomIn, ZoomOut, RotateCw, Download, Eye } from "lucide-react"





const FileViewer = ({ file, onClose }) => {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  // Prevent right-click context menu
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault()
    }

    const handleKeyDown = (e) => {
      // Prevent common download shortcuts
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl border-b border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
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
            {/* Zoom Controls */}
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

            {/* Rotate Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRotate}
              className="p-2 bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </motion.button>

            {/* Reset Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-sm font-medium"
            >
              Reset
            </motion.button>

            {/* Close Button */}
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
      </div>

      {/* File Content */}
      <div className="flex-1 overflow-auto bg-gray-900 p-4">
        <div className="flex items-center justify-center min-h-full">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-full max-h-full"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
            }}
          >
            {file.type === "pdf" ? (
              <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{file.title}</h3>
                  <p className="text-gray-600">PDF Document Preview</p>
                  <div className="bg-gray-100 p-6 rounded-lg">
                    <p className="text-gray-700 mb-4">This is a sample PDF document view.</p>
                    <p className="text-gray-700 mb-4">Subject: {file.subject}</p>
                    <p className="text-gray-700 mb-4">Year: {file.year}</p>
                    <p className="text-gray-700">
                      In a real implementation, you would integrate a PDF viewer library like react-pdf or pdf.js to
                      display the actual PDF content.
                    </p>
                  </div>
                </div>
              </div>
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
      </div>

      {/* Footer */}
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
