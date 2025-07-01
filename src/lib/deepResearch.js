import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  dangerouslyAllowBrowser: true
});

export async function generateDeepResearch(doctorName, productName, basicScanResult) {
  try {
    // Stage 1: Comprehensive Doctor Analysis
    const doctorDeepDive = await openai.chat.completions.create({
      model: "openai/gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are an elite medical intelligence analyst creating comprehensive 20-page research reports for high-value sales prospects."
        },
        {
          role: "user", 
          content: `Create a comprehensive research report on Dr. ${doctorName}. This should be 4-5 pages covering:
          
          SECTION 1: PROFESSIONAL PROFILE
          - Complete medical background and credentials
          - Specialty focus and subspecialties 
          - Career trajectory and key milestones
          - Medical school, residency, fellowships
          - Board certifications and continuing education
          
          SECTION 2: PRACTICE INTELLIGENCE
          - Practice type, size, and structure
          - Patient demographics and volume
          - Geographic market analysis
          - Referral patterns and professional network
          - Technology adoption history
          
          SECTION 3: BEHAVIORAL ANALYSIS
          - Decision-making patterns
          - Innovation adoption curve position
          - Communication preferences
          - Meeting and presentation preferences
          - Objection patterns and concerns
          
          SECTION 4: FINANCIAL & GROWTH INDICATORS
          - Practice growth trajectory
          - Investment patterns in new technology
          - Revenue indicators and financial health
          - Expansion plans and future outlook
          
          SECTION 5: STRATEGIC POSITIONING
          - Competitive landscape analysis
          - Market positioning and reputation
          - Thought leadership and industry involvement
          - Speaking engagements and publications
          
          Make this detailed, actionable, and sales-focused. Include specific recommendations for approach timing, messaging, and relationship building.`
        }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });

    // Stage 2: Product-Market Fit Analysis
    const productAnalysis = await openai.chat.completions.create({
      model: "openai/gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a medical device/pharmaceutical strategic analyst creating detailed product positioning reports."
        },
        {
          role: "user",
          content: `Create a comprehensive product analysis for ${productName} as it relates to Dr. ${doctorName}'s practice. This should be 4-5 pages covering:
          
          SECTION 6: PRODUCT DEEP DIVE
          - Complete technical specifications and capabilities
          - Clinical evidence and research backing
          - Regulatory status and approvals
          - Competitive comparison matrix
          - Unique value propositions
          
          SECTION 7: MARKET POSITIONING
          - Target market analysis and sizing
          - Adoption rates and market penetration
          - Pricing strategy and ROI models
          - Distribution channels and partnerships
          - Market trends and future outlook
          
          SECTION 8: CLINICAL INTEGRATION
          - Workflow integration requirements
          - Training and implementation timeline
          - Staff impact and change management
          - Patient experience improvements
          - Measurable outcome expectations
          
          SECTION 9: FINANCIAL MODELING
          - Investment requirements and payment options
          - ROI calculations and payback period
          - Revenue enhancement opportunities
          - Cost savings and efficiency gains
          - Risk mitigation and guarantees
          
          SECTION 10: IMPLEMENTATION ROADMAP
          - Pilot program options
          - Phased rollout strategies
          - Success metrics and KPIs
          - Support and maintenance plans
          - Scaling and expansion opportunities
          
          Focus on how this product specifically fits Dr. ${doctorName}'s practice profile and needs.`
        }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });

    // Stage 3: Sales Strategy & Execution Plan
    const salesStrategy = await openai.chat.completions.create({
      model: "openai/gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are an elite medical sales strategist creating detailed tactical execution plans."
        },
        {
          role: "user",
          content: `Based on the intelligence gathered, create a detailed sales execution plan for selling ${productName} to Dr. ${doctorName}. This should be 4-5 pages covering:
          
          SECTION 11: TACTICAL SALES PLAN
          - Multi-touch engagement strategy
          - Optimal timing and sequencing
          - Key stakeholder identification
          - Decision-maker mapping
          - Influence network analysis
          
          SECTION 12: MESSAGING FRAMEWORK
          - Primary value propositions by audience
          - Objection handling scripts
          - Proof points and case studies
          - Demonstration strategies
          - Follow-up sequences
          
          SECTION 13: RELATIONSHIP BUILDING
          - Trust-building activities
          - Value-add touchpoints
          - Educational content strategy
          - Networking opportunities
          - Referral generation tactics
          
          SECTION 14: NEGOTIATION STRATEGY
          - Pricing discussions and flexibility
          - Contract terms and conditions
          - Implementation timeline negotiations
          - Support and service agreements
          - Long-term partnership opportunities
          
          SECTION 15: SUCCESS METRICS & TRACKING
          - Opportunity scoring and qualification
          - Pipeline management and forecasting
          - Activity tracking and optimization
          - Relationship health monitoring
          - Outcome measurement and reporting
          
          Include specific scripts, templates, and tactical recommendations that can be immediately implemented.`
        }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });

    // Stage 4: Competitive Intelligence & Market Context
    const competitiveIntelligence = await openai.chat.completions.create({
      model: "openai/gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a competitive intelligence specialist providing market context and competitive analysis."
        },
        {
          role: "user",
          content: `Create a competitive intelligence and market context report for the ${productName} sale to Dr. ${doctorName}. This should be 3-4 pages covering:
          
          SECTION 16: COMPETITIVE LANDSCAPE
          - Direct and indirect competitors
          - Competitive strengths and weaknesses
          - Market share and positioning
          - Recent competitive activities
          - Differentiation opportunities
          
          SECTION 17: MARKET DYNAMICS
          - Industry trends and disruptions
          - Regulatory changes and impacts
          - Technology evolution and innovation
          - Customer behavior shifts
          - Future market predictions
          
          SECTION 18: STRATEGIC RECOMMENDATIONS
          - Optimal positioning against competition
          - Timing considerations and market windows
          - Risk mitigation strategies
          - Partnership and alliance opportunities
          - Long-term relationship development
          
          SECTION 19: ACTION ITEMS & NEXT STEPS
          - Immediate actions (next 48 hours)
          - Short-term tactics (next 30 days)
          - Medium-term strategy (next 90 days)
          - Long-term relationship building (6-12 months)
          - Success milestones and checkpoints
          
          Provide specific, actionable intelligence that gives the sales rep a competitive advantage.`
        }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });

    return {
      doctorProfile: doctorDeepDive.choices[0].message.content,
      productAnalysis: productAnalysis.choices[0].message.content,
      salesStrategy: salesStrategy.choices[0].message.content,
      competitiveIntelligence: competitiveIntelligence.choices[0].message.content,
      generatedAt: new Date().toISOString(),
      estimatedPages: 18
    };

  } catch (error) {
    console.error('Deep research generation failed:', error);
    throw new Error('Failed to generate deep research report');
  }
}