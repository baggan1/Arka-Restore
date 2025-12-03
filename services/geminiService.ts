import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { RecommendationResponse } from "../types";

// Helper to get client instance
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Retry utility for API calls
async function withRetry<T>(fn: () => Promise<T>, retries = 3, baseDelay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    // Check for rate limit (429) or service unavailable (503)
    const isRetryable = err.status === 429 || err.code === 429 || err.status === 503 || err.code === 503 || (err.message && err.message.includes('429'));
    
    if (retries > 0 && isRetryable) {
      console.warn(`API call failed with ${err.status || err.code || 'error'}. Retrying in ${baseDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, baseDelay));
      return withRetry(fn, retries - 1, baseDelay * 2);
    }
    
    // Provide a user-friendly message for quota exhaustion after retries fail
    if (err.status === 429 || err.code === 429 || (err.message && err.message.includes('429'))) {
        throw new Error("Usage limit reached. Please wait a moment or check your billing quota.");
    }
    
    throw err;
  }
}

// 1. Recommend Poses
export const getYogaRecommendations = async (ailment: string): Promise<RecommendationResponse> => {
  const ai = getAiClient();
  
  const response = await withRetry(() => ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Recommend a yoga sequence for someone suffering from "${ailment}". 
    Provide an overview and 3-4 specific poses. 
    For each pose, provide clear steps, do's, and don'ts.
    IMPORTANT: Provide a very detailed visual description of the body's position for the 'description' field, as this will be used to generate an image.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overview: { type: Type.STRING, description: "A brief comforting overview of why yoga helps this ailment." },
          poses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                sanskritName: { type: Type.STRING },
                description: { type: Type.STRING, description: "Detailed visual description of the body position (e.g. arms raised, spine arched, legs straight) for image generation." },
                benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
                steps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Step by step instructions" },
                dos: { type: Type.ARRAY, items: { type: Type.STRING } },
                donts: { type: Type.ARRAY, items: { type: Type.STRING } },
                difficulty: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Advanced"] },
                duration: { type: Type.STRING, description: "Recommended hold time, e.g., '30 seconds'" }
              },
              required: ["name", "sanskritName", "description", "steps", "dos", "donts", "difficulty", "duration"]
            }
          }
        },
        required: ["overview", "poses"]
      }
    }
  })) as GenerateContentResponse;

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as RecommendationResponse;
};

// 2. Generate Image using Gemini Flash Image
export const generatePoseImage = async (poseName: string, sanskritName: string, description: string): Promise<string> => {
  const ai = getAiClient();

  // Dynamic settings to provide visual variety
  const settings = [
    "Peaceful minimalist yoga studio with soft morning light and wooden floors",
    "Serene outdoor deck overlooking a calm ocean at sunrise",
    "Quiet forest clearing with dappled sunlight filtering through trees",
    "Spacious, modern living room with large windows and indoor plants",
    "Zen garden with sand, stones, and bamboo background",
    "Clean, professional white studio background with soft lighting"
  ];

  // Dynamic instructor types
  const instructors = [
    "fit female yoga instructor",
    "fit male yoga instructor",
    "focused yoga practitioner"
  ];

  const selectedSetting = settings[Math.floor(Math.random() * settings.length)];
  const selectedInstructor = instructors[Math.floor(Math.random() * instructors.length)];

  const prompt = `A professional, photorealistic photo of a ${selectedInstructor} demonstrating the ${poseName} (${sanskritName}) with perfect form.
  
  Visual & Anatomical Details:
  ${description}
  
  Setting: ${selectedSetting}.
  Lighting: Soft, natural, and flattering.
  Style: High-resolution, 4k, cinematic, instructional photography.`;

  const response = await withRetry(() => ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4", // Portrait orientation
      }
    }
  })) as GenerateContentResponse;

  // Find the image part
  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  
  if (part && part.inlineData) {
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  }

  throw new Error("No image generated");
};

// 3. Generate Video using Veo
export const generatePoseVideo = async (poseName: string, sanskritName: string, description: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Instructional yoga video: A fitness instructor demonstrating the ${poseName} (${sanskritName}) pose perfectly. 
  Visual details: ${description}.
  Background: Bright, neutral studio. 
  Shot: Full body, stable angle, clear movement.`;

  let operation = await withRetry(() => ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  })) as any;

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await withRetry(() => ai.operations.getVideosOperation({operation: operation})) as any;
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed");

  // The Veo response gives a URI that needs authentication. 
  // We fetch it here with the key to get a blob we can play.
  const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  if (!response.ok) throw new Error("Failed to download video");
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};