'use client'

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface ServerResponse {
  success: boolean
  pdfData?: string
  error?: string
  message: string
}

export default function Home() {
  const [pdfData, setPdfData] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    setPdfData(null)

    try {
      const response = await fetch('/api/generate-presentation', {
        method: 'POST',
        body: formData,
      })

      const result: ServerResponse = await response.json()

      if (result.success && result.pdfData) {
        setPdfData(result.pdfData)
      } else {
        setError(result.error || 'Failed to generate presentation')
      }
    } catch (err) {
      setError('An error occurred while generating the presentation')
    } finally {
      setIsLoading(false)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1))
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Create Decks
          </h1>
          <p className="text-gray-700">
            Enter your topic to get started
          </p>
        </div>

        {!pdfData ? (
          <div className="max-w-2xl mx-auto">
            <form action={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="input" className="sr-only">
                  Enter your topic
                </label>
                <textarea
                  id="input"
                  name="input"
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-black placeholder-gray-500 resize-none"
                  placeholder="What would you like to create a presentation about? Describe your topic, key points, or any specific requirements..."
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating Presentation...' : 'Create Presentation'}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-black">Generated Presentation</h2>
              <button
                onClick={() => {
                  setPdfData(null)
                  setError(null)
                  setPageNumber(1)
                  setNumPages(null)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Create New Presentation
              </button>
            </div>

            <div className="flex justify-center items-center space-x-4 mb-4">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={pageNumber >= (numPages || 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>

            <div className="flex justify-center">
              {pdfData ? (
                <Document
                  file={`data:application/pdf;base64,${pdfData}`}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="shadow-lg"
                >
                  <Page
                    pageNumber={pageNumber}
                    width={800}
                    className="border border-gray-300"
                  />
                </Document>
              ) : (
                <div className="flex items-center justify-center w-[800px] h-[600px] border border-gray-300 bg-gray-50">
                  <p className="text-gray-500">Loading PDF...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
