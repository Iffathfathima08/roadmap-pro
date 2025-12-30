import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goalTitle, goalDescription, deadline } = await req.json();
    
    console.log('Generating roadmap for goal:', goalTitle);

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `You are an expert learning coach. Create a step-by-step roadmap to achieve this goal.

Goal: ${goalTitle}
Description: ${goalDescription || 'No additional description'}
Deadline: ${deadline || 'No specific deadline'}

Generate a roadmap with 5-8 actionable steps. Each step should be:
- Clear and specific
- Achievable in a reasonable timeframe
- Building on previous steps

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "title": "Roadmap to: [goal title]",
  "description": "A step-by-step journey to achieve your goal",
  "steps": [
    {"order": 1, "title": "Step title", "description": "Brief description of what to do"},
    {"order": 2, "title": "Step title", "description": "Brief description of what to do"}
  ],
  "mermaidCode": "flowchart TD\\n    Start([🎯 Start])\\n    Step1[📚 Step 1 Title]\\n    Step2[💻 Step 2 Title]\\n    Step3[🔧 Step 3 Title]\\n    End([🏆 Goal Achieved!])\\n    Start --> Step1\\n    Step1 --> Step2\\n    Step2 --> Step3\\n    Step3 --> End"
}

Important: The mermaidCode should be a valid Mermaid flowchart showing the journey from start to goal completion. Use emojis to make it visually appealing.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a helpful learning coach that creates actionable roadmaps. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    let content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Clean up the response - remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let roadmapData;
    try {
      roadmapData = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Fallback roadmap
      roadmapData = {
        title: `Roadmap to: ${goalTitle}`,
        description: `A step-by-step journey to achieve: ${goalTitle}`,
        steps: [
          { order: 1, title: "Research & Plan", description: "Understand the fundamentals and create a learning plan" },
          { order: 2, title: "Learn Basics", description: "Master the foundational concepts" },
          { order: 3, title: "Practice", description: "Apply what you've learned through exercises" },
          { order: 4, title: "Build Projects", description: "Create real projects to solidify knowledge" },
          { order: 5, title: "Review & Refine", description: "Assess progress and identify areas for improvement" },
        ],
        mermaidCode: `flowchart TD
    Start([🎯 Start: ${goalTitle}])
    Step1[📚 Research & Plan]
    Step2[💡 Learn Basics]
    Step3[💻 Practice]
    Step4[🔧 Build Projects]
    Step5[✅ Review & Refine]
    End([🏆 Goal Achieved!])
    Start --> Step1
    Step1 --> Step2
    Step2 --> Step3
    Step3 --> Step4
    Step4 --> Step5
    Step5 --> End`
      };
    }

    console.log('Roadmap generated successfully');

    return new Response(JSON.stringify(roadmapData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating roadmap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate roadmap';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
