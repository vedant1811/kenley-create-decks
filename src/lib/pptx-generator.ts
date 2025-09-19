import { Automizer, modify } from 'pptx-automizer'
import path from 'path'
import fs from 'fs'
import variants from './variants.json'

export interface Slides {
  name: string // 3 Checkboxes.pptx
  props: { [key: string]: string }
}

export async function generatePowerPoint(slides: Slides[]): Promise<string> {
  const automizer = new Automizer({
    templateDir: path.join(process.cwd(), 'src', 'lib', 'slides'),
    outputDir: path.join(process.cwd(), 'temp'),
    removeExistingSlides: true,
  })

  const pres = automizer.loadRoot('Cover.pptx') // Start with a base template

  for (const slideData of slides) {

    // Find the variant template
    const variantTemplate = variants.find(v => v.name === slideData.name)
    if (!variantTemplate) {
      console.warn(`Variant template not found: ${slideData.name}`)
      continue
    }
    console.log(`Adding slide: ${slideData.name}`)

    // Add slide using the variant template
    pres.addSlide(slideData.name, 1, (slide) => {
      // Replace text content based on variant properties
      for (const [templateKey, templateValue] of Object.entries(variantTemplate.properties)) {
        console.log(`Replacing "${templateValue}" with "${slideData.props[templateKey]}"`)
        const newValue = slideData.props[templateKey]
        if (newValue) {
          slide.modifyElement(`${templateKey}Placeholder`, [
            modify.replaceText([
              { replace: templateValue, by: { text: newValue } }
            ])
          ])
          console.log(`Replaced "${templateValue}" with "${newValue}"`)
        }
      }
    })
  }

  // Generate the final presentation
  const result = await pres.write('GeneratedPresentation.pptx')

  // Save to a local file
  const outputPath = path.join(process.cwd(), 'output', 'GeneratedPresentation.pptx')
  const outputDir = path.dirname(outputPath)

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Copy the generated file to the output directory
  const generatedPath = path.join(process.cwd(), 'temp', 'GeneratedPresentation.pptx')
  fs.copyFileSync(generatedPath, outputPath)

  console.log(`PowerPoint saved to: ${outputPath}`)
  return outputPath
}
