import { Groq } from 'groq-sdk';
import type { Message } from '../../../types';

const client = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

const HF_API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev";
const HF_TOKEN = import.meta.env.VITE_HUGGINGFACE_TOKEN;

export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
        'x-use-cache': 'true',
        'x-wait-for-model': 'true'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: 512,
          height: 512,
          guidance_scale: 7.5,
          num_inference_steps: 50,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

export async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

export async function analyzeImage(imageUrl: string, age: number): Promise<Message> {
  try {
    const completion = await client.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "system",
          content: `You are Wonder Whiz, an AI learning companion for children age ${age}. Analyze the image and explain what you see in an engaging, educational way.`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "What do you see in this image?" },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      temperature: 0.7,
      max_tokens: 1024
    });

    return {
      id: Date.now().toString(),
      content: completion.choices[0].message.content || "I'm having trouble seeing the image clearly. Could you try uploading it again?",
      sender: 'assistant',
      timestamp: Date.now(),
      imageUrl,
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}

export function getTopicPrompts(topic?: string): string[] {
  const defaultPrompts = [
    "A magical learning adventure",
    "A curious explorer discovering something new",
    "A colorful world of knowledge"
  ];

  const topicPrompts: Record<string, string[]> = {
    space: [
      "An astronaut floating among colorful planets",
      "A rocket launching into a starry night sky",
      "The Milky Way galaxy with swirling stars"
    ],
    science: [
      "A laboratory with magical experiments",
      "DNA strands glowing with rainbow colors",
      "Microscopic world full of life"
    ],
    nature: [
      "A magical forest with glowing plants",
      "Underwater scene with colorful sea creatures",
      "A butterfly garden in full bloom"
    ]
  };

  return topic && topic in topicPrompts ? topicPrompts[topic] : defaultPrompts;
}