```typescript
import { generateImage } from './generator';
import { downloadImage } from './downloader';
import { analyzeImage } from './analyzer';
import { getTopicPrompts, enhancePrompt } from './prompts';
import { ImageError } from './types';

export {
  generateImage,
  downloadImage,
  analyzeImage,
  getTopicPrompts,
  enhancePrompt,
  ImageError,
};

export type { ImageGenerationOptions, ImagePrompt } from './types';
```