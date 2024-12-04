```typescript
import { Groq } from 'groq-sdk';

export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is required in environment variables');
}

export const client = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export const API_CONFIG = {
  model: "mixtral-8x7b-32768",
  temperature: 0.7,
  max_tokens: 1000,
  response_format: { type: "json_object" }
} as const;

export const RATE_LIMIT = {
  tokensPerMinute: 5000,
  resetInterval: 60 * 1000, // 1 minute
  maxRetries: 3,
  minDelay: 2000, // 2 seconds
  maxDelay: 10000, // 10 seconds
  estimatedTokens: {
    chat: 200,
    blocks: 300,
    image: 100
  }
} as const;
```