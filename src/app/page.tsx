import { redirect } from 'next/navigation'
import { generatePresentationContent } from '@/lib/openai'
import { generatePowerPoint, Slide } from '@/lib/pptx-generator'

async function handleSubmit(formData: FormData) {
  'use server'

  const input = formData.get('input') as string

  if (input && input.trim()) {
    // Generate presentation content using OpenAI
    const slides: Slide[] = await generatePresentationContent(input)
    console.log('Generated slides:', slides)

    // Generate PowerPoint presentation
    const outputPath = await generatePowerPoint(slides)
    console.log('PowerPoint generated successfully at:', outputPath)

    // For now, just redirect back to the same page
    // In a real app, you might save the file and provide a download link
    redirect('/')
  }
}

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-2xl w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-2">
            Create Decks
          </h1>
          <p className="text-gray-700 mb-8">
            Enter your topic to get started
          </p>
        </div>

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
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Create Presentation
          </button>
        </form>
      </div>
    </div>
  )
}
