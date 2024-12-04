```typescript
export class APIError extends Error {
  constructor(
    message: string,
    public readonly code: 'API_ERROR' | 'PARSE_ERROR' | 'VALIDATION_ERROR' | 'RATE_LIMIT',
    public readonly context?: any
  ) {
    super(message);
    this.name = 'APIError';
  }

  static fromError(error: unknown): APIError {
    if (error instanceof APIError) {
      return error;
    }

    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return new APIError(
          'Please wait a moment before making more requests.',
          'RATE_LIMIT',
          { error }
        );
      }

      if (error.message.includes('parse')) {
        return new APIError(
          'Failed to process response',
          'PARSE_ERROR',
          { error }
        );
      }

      return new APIError(
        error.message,
        'API_ERROR',
        { error }
      );
    }

    return new APIError(
      'An unexpected error occurred',
      'API_ERROR',
      { error }
    );
  }

  static isRetryable(error: APIError): boolean {
    return error.code === 'RATE_LIMIT';
  }

  get userMessage(): string {
    switch (this.code) {
      case 'RATE_LIMIT':
        return 'Taking a quick break to recharge my magic! Please try again in a moment. ✨';
      case 'PARSE_ERROR':
        return 'Oops! My magic got a bit jumbled. Let\'s try that again!';
      case 'VALIDATION_ERROR':
        return 'Something unexpected happened. Could you rephrase your question?';
      default:
        return 'My magic needs a quick break. Let\'s try that again!';
    }
  }
}
```