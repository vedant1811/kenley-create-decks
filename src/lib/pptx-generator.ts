import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'

export interface Slide {
  name: string // 3 Checkboxes.pptx
  props: { [key: string]: string }
}

export const outputPath = path.join(process.cwd(), 'src', 'lib', 'output', 'GeneratedPresentation.pptx')

export async function generatePowerPoint(slides: Slide[]): Promise<string> {
  const pythonScriptPath = path.join(process.cwd(), 'src', 'lib', 'python', 'main.py')

  console.log('Python script path:', pythonScriptPath)
  console.log('Output path:', outputPath)

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Convert slides to the format expected by Python script
  const pythonInput = {
    slides: slides.map(slide => ({
      variant: slide.name,
      content: slide.props
    }))
  }

  console.log('Processing slides:', slides.length)
  console.log('Python input:', JSON.stringify(pythonInput, null, 2))

  return new Promise((resolve, reject) => {
    // Check if Python script exists
    if (!fs.existsSync(pythonScriptPath)) {
      reject(new Error(`Python script not found: ${pythonScriptPath}`))
      return
    }

    // Spawn Python process
    const pythonProcess = spawn('python3', [pythonScriptPath], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    // Collect stdout
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    // Collect stderr
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    // Handle process completion
    pythonProcess.on('close', (code) => {
      console.log('Python process stdout:', stdout)
      if (stderr) {
        console.log('Python process stderr:', stderr)
      }

      if (code !== 0) {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`))
        return
      }

      // Check if output file was created
      if (!fs.existsSync(outputPath)) {
        reject(new Error(`Output file not created: ${outputPath}`))
        return
      }

      // Verify file has content
      const stats = fs.statSync(outputPath)
      if (stats.size === 0) {
        reject(new Error('Output file is empty'))
        return
      }

      console.log(`✅ PowerPoint generated successfully!`)
      console.log(`📁 File: ${outputPath}`)
      console.log(`📊 Size: ${stats.size} bytes`)

      resolve(outputPath)
    })

    // Handle process errors
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`))
    })

    // Send JSON input to Python process
    pythonProcess.stdin.write(JSON.stringify(pythonInput))
    pythonProcess.stdin.end()
  })
}
