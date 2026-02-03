/**
 * Error handling utilities
 */

export class RevenueCatAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'RevenueCatAPIError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function isUserCancelled(error: any): boolean {
  return error.message === 'CANCELLED' || error.name === 'ExitPromptError';
}

export function handleAPIError(error: any): never {
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 401:
        throw new RevenueCatAPIError('Invalid API key', status, data);
      case 409:
        throw new RevenueCatAPIError('Resource already exists', status, data);
      case 422:
        throw new RevenueCatAPIError(`Invalid input: ${JSON.stringify(data)}`, status, data);
      default:
        throw new RevenueCatAPIError(
          `API error (${status}): ${JSON.stringify(data)}`,
          status,
          data
        );
    }
  }

  throw error;
}
