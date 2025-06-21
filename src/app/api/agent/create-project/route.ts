import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { classifyError } from '@/lib/utils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const planningPrompt = `
You are an expert AI software architect specializing in Next.js and modern web technologies.
A user has provided a high-level prompt for a web application. Your task is to think step-by-step and create a comprehensive and structured plan that a team of AI developers can execute.

User Prompt: "{prompt}"

First, think about the overall architecture of the application. What pages are needed? What API endpoints are required? What reusable React components would be beneficial? How should the data be structured?

Based on your architectural thinking, generate a JSON object representing the file structure. For each file, provide a path and a detailed description that will serve as a precise prompt for the AI developer who will write the code.

The JSON structure must be:
{
  "project_name": "Name of the Project",
  "files": [
    { 
      "path": "/path/to/file.ext", 
      "description": "A detailed description of this file's purpose, the technologies to use (e.g., 'React Server Component', 'shadcn/ui for components'), and its key responsibilities. Mention any other files it will depend on. For example: 'This is the main landing page, built as a React Server Component. It should fetch data from /api/posts and display each post using the BlogPostCard component. Use shadcn/ui components for styling the layout.'",
      "dependencies": ["/path/to/dependency1.tsx", "/api/posts/route.ts"]
    }
  ]
}

Key instructions:
- Place all pages under 'src/app/'.
- Place all API routes under 'src/app/api/'.
- Place all reusable components under 'src/components/'.
- Use 'shadcn/ui' for UI components where appropriate.
- Ensure the file paths are logical and follow Next.js conventions.
- The 'dependencies' array for each file should list other files in this plan that it directly imports or fetches data from. This is crucial for generation order.
- The root 'page.tsx' should be the main entry point for the application.

Now, generate the complete and detailed plan for the user's prompt.
`;

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = 'gpt-4o' } = await req.json();

    if (!prompt) {
      return NextResponse.json({ 
        error: 'Prompt is required',
        type: 'validation'
      }, { status: 400 });
    }

    if (prompt.length < 10) {
      return NextResponse.json({ 
        error: 'Prompt must be at least 10 characters long',
        type: 'validation'
      }, { status: 400 });
    }

    let content: string | null = null;

    if (model.startsWith('gpt')) {
      const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'system', content: planningPrompt }, { role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1, // Lower temperature for more consistent planning
        max_tokens: 4000, // Ensure we have enough tokens for complex plans
      });
      content = response.choices[0].message.content;
    } else if (model.startsWith('claude')) {
      const response = await anthropic.messages.create({
        model: model,
        max_tokens: 4096,
        system: planningPrompt,
        messages: [{ role: 'user', content: prompt }],
      });
      const textBlock = response.content.find(block => block.type === 'text');
      content = textBlock ? textBlock.text : null;
    } else {
      return NextResponse.json({ error: 'Unsupported model' }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: 'No plan generated' }, { status: 500 });
    }
    
    // Sometimes the model might still wrap the JSON in markdown
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
    const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : content;

    const result = JSON.parse(jsonString);
    
    return NextResponse.json({ plan: result });

  } catch (error) {
    console.error('Error generating project plan:', error);
    
    const errorInfo = classifyError(error);
    
    if (errorInfo.type === 'auth') {
      return NextResponse.json({ 
        error: 'OpenAI API key is invalid or missing',
        type: 'auth',
        details: 'Please check your OpenAI API key configuration'
      }, { status: 401 });
    }
    
    if (errorInfo.retryable) {
      return NextResponse.json({ 
        error: errorInfo.message,
        type: errorInfo.type,
        retryable: true,
        details: 'This error may be temporary. Please try again.'
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to generate project plan',
      type: 'unknown',
      details: errorInfo.message
    }, { status: 500 });
  }
} 