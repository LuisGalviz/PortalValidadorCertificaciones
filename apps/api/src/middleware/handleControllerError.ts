import type { NextFunction } from 'express';
import { config } from '../config/index.js';
import { AppError } from './errorHandler.js';

interface HandleErrorOptions {
  zodMessage?: string;
  statusCode?: number;
}

function getCauseMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const cause = (error as { cause?: unknown }).cause;
  if (!cause) {
    return null;
  }

  if (cause instanceof Error) {
    return cause.message;
  }

  if (typeof cause === 'string') {
    return cause;
  }

  if (typeof cause === 'object' && 'message' in cause) {
    return String((cause as { message?: unknown }).message);
  }

  return null;
}

function buildDevMessage(message: string, error: Error): string {
  const causeMessage = getCauseMessage(error);
  if (causeMessage) {
    if (error.message && error.message !== message) {
      return `${message}: ${error.message}: ${causeMessage}`;
    }
    return `${message}: ${causeMessage}`;
  }

  if (error.message && error.message !== message) {
    return `${message}: ${error.message}`;
  }

  return message;
}

export function handleControllerError(
  error: unknown,
  next: NextFunction,
  message: string,
  options: HandleErrorOptions = {}
): void {
  if (error instanceof AppError) {
    next(error);
    return;
  }

  if (error instanceof Error && error.name === 'ZodError') {
    next(new AppError(400, options.zodMessage ?? 'Invalid request data'));
    return;
  }

  if (error instanceof Error && config.nodeEnv !== 'production') {
    next(new AppError(options.statusCode ?? 500, buildDevMessage(message, error)));
    return;
  }

  next(new AppError(options.statusCode ?? 500, message));
}
