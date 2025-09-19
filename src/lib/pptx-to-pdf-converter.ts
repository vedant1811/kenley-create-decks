import fs from 'fs'
import path from 'path'

export interface ConversionOptions {
  inputPath: string
  outputPath?: string
  apiUrl?: string
}

export interface ConversionResult {
  success: boolean
  outputPath?: string
  error?: string
}

/**
 * Converts a PPTX file to PDF using the LibreOffice API
 * @param options - Conversion options including input path and optional output path
 * @returns Promise<ConversionResult> - Result of the conversion operation
 */
export async function convertPptxToPdf(options: ConversionOptions): Promise<ConversionResult> {
  const { inputPath, outputPath, apiUrl = 'http://localhost:3001/forms/libreoffice/convert' } = options

  try {
    // Validate input file exists
    if (!fs.existsSync(inputPath)) {
      return {
        success: false,
        error: `Input file does not exist: ${inputPath}`
      }
    }

    // Validate file extension
    if (!inputPath.toLowerCase().endsWith('.pptx')) {
      return {
        success: false,
        error: 'Input file must be a PPTX file'
      }
    }

    // Generate output path if not provided
    const finalOutputPath = outputPath || inputPath.replace(/\.pptx$/i, '.pdf')

    // Create form data for the API request
    const formData = new FormData()
    const fileBuffer = fs.readFileSync(inputPath)
    const fileBlob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
    formData.append('files', fileBlob, path.basename(inputPath))

    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      return {
        success: false,
        error: `API request failed with status: ${response.status} ${response.statusText}`
      }
    }

    // Get the PDF content from the response
    const pdfBuffer = await response.arrayBuffer()

    // Write the PDF to the output file
    fs.writeFileSync(finalOutputPath, Buffer.from(pdfBuffer))

    return {
      success: true,
      outputPath: finalOutputPath
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during conversion'
    }
  }
}

/**
 * Converts multiple PPTX files to PDF
 * @param inputPaths - Array of input PPTX file paths
 * @param outputDir - Optional output directory for PDF files
 * @param apiUrl - Optional API URL
 * @returns Promise<ConversionResult[]> - Array of conversion results
 */
export async function convertMultiplePptxToPdf(
  inputPaths: string[],
  outputDir?: string,
  apiUrl?: string
): Promise<ConversionResult[]> {
  const results: ConversionResult[] = []

  for (const inputPath of inputPaths) {
    const outputPath = outputDir
      ? path.join(outputDir, path.basename(inputPath).replace(/\.pptx$/i, '.pdf'))
      : undefined

    const result = await convertPptxToPdf({
      inputPath,
      outputPath,
      apiUrl
    })

    results.push(result)
  }

  return results
}
