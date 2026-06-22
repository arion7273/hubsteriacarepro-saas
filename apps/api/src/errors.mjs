export class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function badRequest(message) {
  return new ApiError(400, 'bad_request', message);
}

export function notFound(message) {
  return new ApiError(404, 'not_found', message);
}

export function toErrorResponse(error) {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      body: { error: error.code, message: error.message }
    };
  }

  return {
    statusCode: 500,
    body: { error: 'internal_server_error', message: 'An unexpected error occurred.' }
  };
}
