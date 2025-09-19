import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generatePresentationContent(topic: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: "You are a presentation expert. Create a structured outline for a presentation based on the given topic. Return the response in a clear, organized format with main points and sub-points."
        },
        {
          role: "user",
          content: `Create a presentation outline for: ${topic}`
        }
      ],
    })

    return completion.choices[0]?.message?.content || "Failed to generate content"
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate presentation content')
  }
}
