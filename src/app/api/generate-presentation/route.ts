import { NextRequest, NextResponse } from 'next/server'
import { generatePresentationContent } from '@/lib/openai'
import { generatePowerPoint, Slide } from '@/lib/pptx-generator'
import { convertPptxToPdf } from '@/lib/pptx-to-pdf-converter'
import { readFile } from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const input = formData.get('input') as string

    if (!input || !input.trim()) {
      return NextResponse.json({
        success: false,
        error: 'No input provided',
        message: 'Please enter a topic for your presentation'
      })
    }

    // Generate presentation content using OpenAI
    const slides: Slide[] = await generatePresentationContent(input)
    console.log('Generated slides:', slides)

    // Generate PowerPoint presentation
    const outputPath = await generatePowerPoint(slides)
    console.log('PowerPoint generated successfully at:', outputPath)

    // Convert PPTX to PDF
    const pdfResult = await convertPptxToPdf({
      inputPath: outputPath,
      outputPath: outputPath.replace('.pptx', '.pdf')
    })

    if (pdfResult.success && pdfResult.outputPath) {
      console.log('PDF generated successfully at:', pdfResult.outputPath)

      // Read the PDF file and return it as base64
      const pdfBuffer = await readFile(pdfResult.outputPath)
      const pdfBase64 = pdfBuffer.toString('base64')

      return NextResponse.json({
        success: true,
        pdfData: pdfBase64,
        message: 'Presentation generated successfully!'
      })
    } else {
      console.error('PDF conversion failed:', pdfResult.error)
      return NextResponse.json({
        success: false,
        error: pdfResult.error,
        message: 'Failed to generate PDF'
      })
    }
  } catch (error) {
    console.error('Error generating presentation:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to generate presentation'
    })
  }
}
