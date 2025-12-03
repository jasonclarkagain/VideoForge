import OpenAI from "openai";
import type {
  GenerateScriptRequest,
  GenerateTitleRequest,
  GenerateDescriptionRequest,
  GenerateThumbnailRequest,
  GenerateIdeasRequest,
  GeneratedScript,
  GeneratedTitle,
  GeneratedDescription,
  GeneratedThumbnail,
  GeneratedIdea,
  Platform,
  platformLimits,
} from "@shared/schema";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own API key.
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const MODEL = "gpt-4o"; // Using gpt-4o for reliable JSON parsing

// Platform limits for reference
const limits: Record<Platform, { title: number; description: number }> = {
  youtube: { title: 100, description: 5000 },
  rumble: { title: 150, description: 2000 },
  bitchute: { title: 100, description: 3000 },
  odysee: { title: 200, description: 5000 },
  tiktok: { title: 150, description: 2200 },
  instagram: { title: 0, description: 2200 },
};

export async function generateScript(
  request: GenerateScriptRequest
): Promise<GeneratedScript> {
  const lengthMinutes = {
    short: "1-3",
    medium: "5-10",
    long: "15-20",
  };

  const prompt = `Generate a video script for the following:
Topic: ${request.topic}
Target Audience: ${request.targetAudience || "General audience"}
Tone: ${request.tone}
Target Length: ${lengthMinutes[request.length]} minutes
Target Platforms: ${request.platforms.join(", ")}
Keywords to include: ${request.keywords || "None specified"}
Additional Notes: ${request.additionalNotes || "None"}

Create an engaging, well-structured script with clear sections. Include:
- A hook/intro to grab attention
- Main content sections
- A strong call-to-action at the end

Response format (JSON):
{
  "script": "The full script text with [SECTION: Name] markers",
  "estimatedDuration": "X minutes",
  "sections": ["Section 1 Name", "Section 2 Name", ...]
}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_completion_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content || "{}";
  return JSON.parse(content) as GeneratedScript;
}

export async function generateTitles(
  request: GenerateTitleRequest
): Promise<{ titles: GeneratedTitle[] }> {
  const maxLength = Math.min(...request.platforms.map((p) => limits[p].title));

  const prompt = `Generate ${request.count} video title options for:
Topic: ${request.topic}
Tone: ${request.tone}
Target Platforms: ${request.platforms.join(", ")}
Keywords to include: ${request.keywords || "None specified"}
Maximum character length: ${maxLength} characters

Create catchy, SEO-optimized titles that will get clicks. Vary the style (questions, lists, how-to, etc.)

Response format (JSON):
{
  "titles": [
    {
      "title": "The title text",
      "characterCount": 45,
      "seoScore": 85
    }
  ]
}

SEO Score should be 1-100 based on:
- Keyword usage
- Emotional hooks
- Clarity
- Length optimization`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_completion_tokens: 2048,
  });

  const content = response.choices[0]?.message?.content || '{"titles":[]}';
  return JSON.parse(content) as { titles: GeneratedTitle[] };
}

export async function generateDescriptions(
  request: GenerateDescriptionRequest
): Promise<{ descriptions: GeneratedDescription[] }> {
  const platformPrompts = request.platforms
    .map(
      (p) =>
        `${p.toUpperCase()}: Max ${limits[p].description} characters`
    )
    .join("\n");

  const prompt = `Generate video descriptions for multiple platforms:
Video Title: ${request.title}
Topic: ${request.topic}
Tone: ${request.tone}
Keywords: ${request.keywords || "None specified"}
Include Hashtags: ${request.includeHashtags ? "Yes" : "No"}
Include Call to Action: ${request.includeCallToAction ? "Yes" : "No"}

Platform Limits:
${platformPrompts}

Create optimized descriptions for EACH platform listed. Include:
- Brief engaging summary
- Key points/timestamps if applicable
- ${request.includeHashtags ? "Relevant hashtags" : "No hashtags"}
- ${request.includeCallToAction ? "Subscribe/like call-to-action" : "No explicit CTA"}

Response format (JSON):
{
  "descriptions": [
    {
      "description": "Full description text",
      "hashtags": ["#tag1", "#tag2"],
      "characterCount": 500,
      "platform": "youtube"
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_completion_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content || '{"descriptions":[]}';
  return JSON.parse(content) as { descriptions: GeneratedDescription[] };
}

export async function generateThumbnails(
  request: GenerateThumbnailRequest
): Promise<{ thumbnails: GeneratedThumbnail[] }> {
  const prompt = `Generate ${request.count} thumbnail design concepts for:
Topic: ${request.topic}
Video Title: ${request.title || "Not specified"}
Style Preference: ${request.style || "Modern and eye-catching"}

Create detailed thumbnail concepts that will stand out and get clicks. Consider:
- Visual hierarchy and focal points
- Color psychology
- Text readability
- Emotional impact

Response format (JSON):
{
  "thumbnails": [
    {
      "concept": "Detailed description of the thumbnail design",
      "textOverlay": "Suggested text to overlay on thumbnail",
      "colorScheme": "Primary colors and their psychological effect",
      "elements": ["Element 1", "Element 2", "Element 3"]
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_completion_tokens: 2048,
  });

  const content = response.choices[0]?.message?.content || '{"thumbnails":[]}';
  return JSON.parse(content) as { thumbnails: GeneratedThumbnail[] };
}

export async function generateIdeas(
  request: GenerateIdeasRequest
): Promise<{ ideas: GeneratedIdea[] }> {
  const prompt = `Generate ${request.count} video content ideas for:
Niche: ${request.niche}
Target Audience: ${request.targetAudience || "General audience"}
Focus on Trending: ${request.trending ? "Yes, include current trends" : "No, focus on evergreen content"}

Create diverse, actionable video ideas with varying difficulty levels. Include:
- Unique angles and perspectives
- Mix of content types (tutorials, reviews, stories, etc.)
- Realistic view potential estimates

Response format (JSON):
{
  "ideas": [
    {
      "title": "Suggested video title",
      "description": "Brief description of what the video would cover",
      "potentialViews": "10K-50K" or "50K-100K" or "100K+",
      "difficulty": "easy" or "medium" or "hard"
    }
  ]
}

Difficulty levels:
- easy: Can be done quickly with minimal equipment
- medium: Requires some preparation or specific resources
- hard: Needs significant research, editing, or production value`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_completion_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content || '{"ideas":[]}';
  return JSON.parse(content) as { ideas: GeneratedIdea[] };
}
