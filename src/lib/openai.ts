import OpenAI from 'openai'
import proposalTemplate from './templates/proposal.json'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const CREATE_SLIDE_TOOL_CALL = {
  type: "function" as const,
  function: {
    name: "create_slide",
    description: "Create a slide for the presentation deck",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The exact title of the slide from the proposal structure"
        },
        relevant_content: {
          type: "string",
          description: "The relevant content for this slide based on the topic"
        }
      },
      required: ["title", "relevant_content"]
    }
  }
}

export async function generatePresentationContent(topic: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You are a presentation expert. Create a deck strictly as per the proposal.json structure.

You MUST respond ONLY with tool calls. Do not include any other text or explanations.

Here is the proposal.json structure:
${JSON.stringify(proposalTemplate, null, 2)}

For each slide in the structure, create relevant content based on the topic provided. Use the exact slide titles from the structure.`
        },
        {
          role: "user",
          content: `Create a presentation deck for: ${topic}`
        }
      ],
      tools: [CREATE_SLIDE_TOOL_CALL],
      tool_choice: "required",
      temperature: 0.1,
    })

    const response = completion.choices[0]?.message

    if (response?.tool_calls) {
      // Parse tool calls and return as JSON string
      const toolCalls = response.tool_calls
        .map((call, i) => {
          const args = JSON.parse(call.function.arguments)
          return {
            slide: i + 1,
            title: args.title,
            content: args.relevant_content
          }
        })
      return JSON.stringify(toolCalls, null, 2)
    }

    return "Failed to generate content"
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate presentation content')
  }
}
