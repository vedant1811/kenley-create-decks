import OpenAI from 'openai'
import proposalTemplate from './templates/proposal.json'
import variants from './variants.json'

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

const USE_VARIANT_TOOL_CALL = {
  type: "function" as const,
  function: {
    name: "use_variant",
    description: "Select a slide variant and provide property values",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the slide variant to use"
        },
        props: {
          type: "object",
          description: "Property values for the selected variant. You MUST provide values for ALL properties defined in the variant's properties object.",
          properties: {
            title: { type: "string" },
            subtitle: { type: "string" },
            date: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            website: { type: "string" },
            bullet1: { type: "string" },
            bullet2: { type: "string" },
            bullet3: { type: "string" },
            checkbox1: { type: "string" },
            checkbox2: { type: "string" },
            checkbox3: { type: "string" },
            step1: { type: "string" },
            step2: { type: "string" },
            step3: { type: "string" },
            step4: { type: "string" },
            title1: { type: "string" },
            description1: { type: "string" },
            title2: { type: "string" },
            description2: { type: "string" },
            feature1: { type: "string" },
            feature2: { type: "string" },
            feature3: { type: "string" },
            section1: { type: "string" },
            section2: { type: "string" },
            section3: { type: "string" },
            imageTitle: { type: "string" },
            imageDescription: { type: "string" },
            section1title: { type: "string" },
            section1description: { type: "string" },
            section2title: { type: "string" },
            section2description: { type: "string" },
            bullet1ForSec1: { type: "string" },
            bullet2ForSec1: { type: "string" },
            bullet1ForSec2: { type: "string" },
            bullet2ForSec2: { type: "string" }
          },
          additionalProperties: { type: "string" }
        }
      },
      required: ["name", "props"]
    }
  }
}

async function callLLM(messages: any[], tools: any[], options: any = {}) {

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages,
    tools,
    tool_choice: "required",
    temperature: 0.1,
    ...options,
  })

  console.log('=== LLM Request ===')
  console.log('Messages:', JSON.stringify(messages, null, 2))

  console.log('=== LLM Response ===')
  const response = completion.choices[0]?.message
  if (response?.tool_calls) {
    const toolCallArgs = response.tool_calls.map(call => {
      if (call.type === 'function') {
        return JSON.parse(call.function.arguments)
      }
      return null
    }).filter(Boolean)
    console.log('Function call arguments:', JSON.stringify(toolCallArgs, null, 2))
  }

  return completion
}

async function selectVariantForSlide(title: string, content: string) {
  const completion = await callLLM(
    [
      {
        role: "system",
        content: `You are a presentation design expert. Select the most appropriate slide variant for the given slide content.

Available variants:
${JSON.stringify(variants, null, 2)}

You MUST respond ONLY with tool calls. Do not include any other text or explanations.

For the selected variant, you MUST provide values for ALL properties defined in that variant. Look at the "properties" object of each variant to see what properties need values.

Example: If you select "Cover.pptx", you must provide:
{
  "name": "Cover.pptx",
  "props": {
    "title": "Your slide title here",
    "subtitle": "Your subtitle here",
    "date": "Your date here"
  }
}`
      },
      {
        role: "user",
        content: `Select a variant for this slide:
Title: ${title}
Content: ${content}`
      }
    ],
    [USE_VARIANT_TOOL_CALL]
  )

  const response = completion.choices[0]?.message
  if (response?.tool_calls) {
    const call = response.tool_calls[0]
    if (call.type === 'function') {
      const args = JSON.parse(call.function.arguments)
      console.log('Variant selection args:', args)
      return {
        name: args.name,
        props: args.props || {}
      }
    }
  }

  return null
}

export async function generatePresentationContent(topic: string) {
  const completion = await callLLM(
    [
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
    [CREATE_SLIDE_TOOL_CALL],
  )

  const response = completion.choices[0]?.message

  if (response?.tool_calls) {
    // Parse tool calls and get variant for each slide
    const slides = response.tool_calls.map(async (call, i) => {
      const args = JSON.parse(call.function.arguments)
      const variant = await selectVariantForSlide(args.title, args.relevant_content)

      return {
        slide: i + 1,
        title: args.title,
        content: args.relevant_content,
        variant: variant
      }
    })

    const slidesWithVariants = await Promise.all(slides)
    return JSON.stringify(slidesWithVariants, null, 2)
  }

  return "Failed to generate content"
}
