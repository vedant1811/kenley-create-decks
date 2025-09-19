import { generatePowerPoint, Slide } from './pptx-generator'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

// [{"name":"Cover.pptx","props":{"title":"Why You Should Adopt AI in Your Organization","subtitle":"Confidential — For client internal use only\\nPrepared by: [Consulting Firm Name]","date":"[Today's Date]"}},{"name":"2 Star bullets.pptx","props":{"title":"Executive Summary & Recommendation","bullet1":"AI adoption is now a strategic imperative: 90% of Fortune 500 companies plan to increase AI budgets by 2026. Early adopters report 25–40% cost savings and 2–3x faster decision-making.","bullet2":"We recommend a phased AI adoption, starting with a 90-day pilot, to unlock $15M in efficiency gains and a 3.5x ROI over three years. Immediate action will secure competitive advantage and future-proof your organization."}},{"name":"Image & Text.pptx","props":{"title":"Client Context & Objectives","imageTitle":"Current Context & Objectives","imageDescription":"Current context: Rapid digital transformation, rising customer expectations, and competitive pressure.\\n\\nKey constraints: Legacy systems, data silos, and talent gaps.\\n\\nObjectives: Achieve 12% revenue uplift, 25–40% cost savings, and faster decision-making.\\n\\nIn scope: Customer support, sales forecasting, and process automation.\\nOut of scope: Full IT infrastructure overhaul."}},{"name":"Four Steps.pptx","props":{"title":"Proposed Approach & Methodology","step1":"90-day pilot (targeted use case)","step2":"6-month scale-up (expand to 2–3 functions)","step3":"Enterprise rollout (year two)","step4":"Methods: Stakeholder interviews, data analysis, rapid prototyping, and workshops. Collaboration: Joint client-consultant teams to accelerate learning and de-risk delivery."}},{"name":"Four Steps.pptx","props":{"title":"Workplan, Timeline & Milestones","step1":"Week 1–2: Stakeholder alignment & data access","step2":"Week 3–12: Pilot implementation & review","step3":"Month 4–9: Scale-up to additional functions","step4":"Month 10–24: Enterprise rollout"}},{"name":"Three Columns.pptx","props":{"title":"Deliverables & Success Metrics","section1":"Deliverables","description1":"AI pilot report, implementation roadmap, training materials, and business case.","section2":"Success Metrics","description2":"40% reduction in support ticket handling time, 18% improvement in sales forecast accuracy, 12% revenue uplift, $15M efficiency gains, 3.5x ROI.","section3":"Tracking & Review","description3":"Benefits tracked via quarterly business reviews."}},{"name":"Three Columns.pptx","props":{"title":"Team, Roles & Ways of Working","section1":"Consulting Team","description1":"AI strategy lead, data scientist, change manager.","section2":"Client Team","description2":"Project sponsor, IT lead, business process owner.","section3":"Ways of Working","description3":"RACI: Consultants (design, delivery), Client (data, adoption). Working norms: Weekly stand-ups, Slack/Teams for comms, 24-hour response time."}},{"name":"Three Columns.pptx","props":{"title":"Relevant Experience & Case Studies","section1":"Case 1: Fortune 500 retailer","description1":"AI-driven customer support, 40% reduction in ticket time, $5M annual savings.","section2":"Case 2: Global manufacturer","description2":"AI sales forecasting, 18% accuracy improvement, 12% revenue uplift.","section3":"References","description3":"References available upon request."}},{"name":"2 Star bullets.pptx","props":{"title":"Commercials, Assumptions & Terms","bullet1":"Pricing: $2M+ upfront investment (pilot + scale-up), hybrid model. Includes consulting, implementation, training. Assumptions: Timely data access, client-side project manager.","bullet2":"Payment: 40% upfront, 30% at scale-up, 30% at rollout. Change control for scope adjustments."}},{"name":"Three Columns.pptx","props":{"title":"Risks, Mitigations & Next Steps","section1":"Risks","description1":"Upfront investment, data security, workforce transition.","section2":"Mitigations","description2":"Phased investment, robust data governance, change management program.","section3":"Next Steps","description3":"Approve pilot, schedule kickoff, grant data access, identify stakeholders."}}]


describe('PowerPoint Generator', () => {
  const testSlides: Slide[] = [
    {
      "name": "Cover.pptx",
      "props": {
        "title": "Why You Should Adopt AI in Your Organization",
        "subtitle": "Confidential — For client internal use only\nPrepared by: [Consulting Firm Name]",
        "date": "[Today's Date]"
      }
    },
    {
      "name": "2 Star bullets.pptx",
      "props": {
        "title": "Executive Summary & Recommendation",
        "bullet1": "AI adoption is now a strategic imperative: 90% of Fortune 500 companies plan to increase AI budgets by 2026. Early adopters report 25–40% cost savings and 2–3x faster decision-making.",
        "bullet2": "We recommend a phased AI adoption, starting with a 90-day pilot, to unlock $15M in efficiency gains and a 3.5x ROI over three years. Immediate action will secure competitive advantage and future-proof your organization."
      }
    },
    {
      "name": "Image & Text.pptx",
      "props": {
        "title": "Client Context & Objectives",
        "imageTitle": "Current Context & Objectives",
        "imageDescription": "Current context: Rapid digital transformation, rising customer expectations, and competitive pressure.\n\nKey constraints: Legacy systems, data silos, and talent gaps.\n\nObjectives: Achieve 12% revenue uplift, 25–40% cost savings, and faster decision-making.\n\nIn scope: Customer support, sales forecasting, and process automation.\nOut of scope: Full IT infrastructure overhaul."
      }
    },
    {
      "name": "Four Steps.pptx",
      "props": {
        "title": "Proposed Approach & Methodology",
        "step1": "90-day pilot (targeted use case)",
        "step2": "6-month scale-up (expand to 2–3 functions)",
        "step3": "Enterprise rollout (year two)",
        "step4": "Methods: Stakeholder interviews, data analysis, rapid prototyping, and workshops. Collaboration: Joint client-consultant teams to accelerate learning and de-risk delivery."
      }
    },
    {
      "name": "Four Steps.pptx",
      "props": {
        "title": "Workplan, Timeline & Milestones",
        "step1": "Week 1–2: Stakeholder alignment & data access",
        "step2": "Week 3–12: Pilot implementation & review",
        "step3": "Month 4–9: Scale-up to additional functions",
        "step4": "Month 10–24: Enterprise rollout"
      }
    },
    {
      "name": "Three Columns.pptx",
      "props": {
        "title": "Deliverables & Success Metrics",
        "section1": "Deliverables",
        "description1": "AI pilot report, implementation roadmap, training materials, and business case.",
        "section2": "Success Metrics",
        "description2": "40% reduction in support ticket handling time, 18% improvement in sales forecast accuracy, 12% revenue uplift, $15M efficiency gains, 3.5x ROI.",
        "section3": "Tracking & Review",
        "description3": "Benefits tracked via quarterly business reviews."
      }
    },
    {
      "name": "Three Columns.pptx",
      "props": {
        "title": "Team, Roles & Ways of Working",
        "section1": "Consulting Team",
        "description1": "AI strategy lead, data scientist, change manager.",
        "section2": "Client Team",
        "description2": "Project sponsor, IT lead, business process owner.",
        "section3": "Ways of Working",
        "description3": "RACI: Consultants (design, delivery), Client (data, adoption). Working norms: Weekly stand-ups, Slack/Teams for comms, 24-hour response time."
      }
    },
    {
      "name": "Three Columns.pptx",
      "props": {
        "title": "Relevant Experience & Case Studies",
        "section1": "Case 1: Fortune 500 retailer",
        "description1": "AI-driven customer support, 40% reduction in ticket time, $5M annual savings.",
        "section2": "Case 2: Global manufacturer",
        "description2": "AI sales forecasting, 18% accuracy improvement, 12% revenue uplift.",
        "section3": "References",
        "description3": "References available upon request."
      }
    },
    {
      "name": "2 Star bullets.pptx",
      "props": {
        "title": "Commercials, Assumptions & Terms",
        "bullet1": "Pricing: $2M+ upfront investment (pilot + scale-up), hybrid model. Includes consulting, implementation, training. Assumptions: Timely data access, client-side project manager.",
        "bullet2": "Payment: 40% upfront, 30% at scale-up, 30% at rollout. Change control for scope adjustments."
      }
    },
    {
      "name": "Three Columns.pptx",
      "props": {
        "title": "Risks, Mitigations & Next Steps",
        "section1": "Risks",
        "description1": "Upfront investment, data security, workforce transition.",
        "section2": "Mitigations",
        "description2": "Phased investment, robust data governance, change management program.",
        "section3": "Next Steps",
        "description3": "Approve pilot, schedule kickoff, grant data access, identify stakeholders."
      }
    }
  ]

  beforeAll(() => {
    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'output')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
  })

  afterAll(() => {
    // Clean up test files
    const outputPath = path.join(process.cwd(), 'output', 'GeneratedPresentation.pptx')
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath)
    }
  })

  test('should generate PowerPoint presentation successfully', async () => {
    console.log(`Processing ${testSlides.length} slides`)

    const outputPath = await generatePowerPoint(testSlides)

    // Verify file was created
    expect(fs.existsSync(outputPath)).toBe(true)

    // Verify file has content
    const stats = fs.statSync(outputPath)
    expect(stats.size).toBeGreaterThan(0)

    console.log(`✅ PowerPoint generated successfully!`)
    console.log(`📁 File: ${outputPath}`)
    console.log(`📊 Size: ${stats.size} bytes`)
  }, 30000) // 30 second timeout

  // test('should handle empty slides array', async () => {
  //   const outputPath = await generatePowerPoint([])

  //   expect(fs.existsSync(outputPath)).toBe(true)
  //   const stats = fs.statSync(outputPath)
  //   expect(stats.size).toBeGreaterThan(0)
  // })

  // test('should process all slide variants correctly', async () => {
  //   const outputPath = await generatePowerPoint(testSlides)

  //   expect(fs.existsSync(outputPath)).toBe(true)

  //   // Verify all slides were processed
  //   expect(testSlides).toHaveLength(10)

  //   // Check that different variants are used
  //   const variantNames = testSlides.map(slide => slide.name)
  //   const uniqueVariants = [...new Set(variantNames)]
  //   expect(uniqueVariants.length).toBeGreaterThan(1)

  //   console.log(`📋 Processed variants: ${uniqueVariants.join(', ')}`)
  // })
})


