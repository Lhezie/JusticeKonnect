// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
    this.errors = [];
  }
}

export class AuthenticationError extends AppError {
  constructor(message) {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message) {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

// Main error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Default error values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific error types
  if (err.name === 'PrismaClientKnownRequestError') {
    handlePrismaError(err, res);
    return;
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    handleJWTError(err, res);
    return;
  }

  if (err.name === 'ValidationError') {
    handleValidationError(err, res);
    return;
  }

  // Development vs Production error response
  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  } else {
    sendProdError(err, res);
  }
};

// Helper functions for specific error types
const handlePrismaError = (err, res) => {
  // Handle common Prisma errors
  switch (err.code) {
    case 'P2002': // Unique constraint violation
      res.status(400).json({
        success: false,
        message: 'A record with this value already exists',
        error: 'Duplicate Entry'
      });
      break;
    case 'P2025': // Record not found
      res.status(404).json({
        success: false,
        message: 'Record not found',
        error: 'Not Found'
      });
      break;
    default:
      res.status(500).json({
        success: false,
        message: 'Database operation failed',
        error: 'Database Error'
      });
  }
};

const handleJWTError = (err, res) => {
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Your token has expired. Please log in again',
      error: 'Token Expired'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again',
      error: 'Invalid Token'
    });
  }
};

const handleValidationError = (err, res) => {
  res.status(400).json({
    success: false,
    message: 'Invalid input data',
    errors: err.errors || [err.message]
  });
};

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendProdError = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  } 
  // Programming or other unknown error: don't leak error details
  else {
    console.error('ERROR ', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};
// Error handler for unhandled rejections
export const handleUncaughtExceptions = () => {
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION!  Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
  });

  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION!  Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
  });
};

// Helper function to wrap async route handlers
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};


