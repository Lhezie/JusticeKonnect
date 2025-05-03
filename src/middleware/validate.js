import { body, validationResult } from 'express-validator';
export const validateSignUp = [
  // Personal Information
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),

  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  // Professional Information
  body('professionalId')
    .notEmpty()
    .withMessage('Professional ID is required')
    .trim(),

  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .trim(),

  body('licenseNumber')
    .notEmpty()
    .withMessage('License number is required')
    .trim(),

  // Optional Professional Details
  body('organization')
    .optional()
    .trim(),

  body('specialty')
    .optional()
    .trim(),

  body('bio')
    .optional()
    .trim(),

  // Validation Result Handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg
        }))
      });
    }
    next();
  },
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['lawyer', 'client'])
    .withMessage('Invalid role specified'),

  // Validation Result Handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg
        }))
      });
    }
    next();
  },
];

// Profile Update Validation
export const validateProfileUpdate = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .trim(),

  body('organization')
    .optional()
    .trim(),

  body('licenseNumber')
    .optional()
    .notEmpty()
    .withMessage('License number cannot be empty')
    .trim(),

  body('specialty')
    .optional()
    .trim(),

  body('bio')
    .optional()
    .trim(),

  // Validation Result Handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg
        }))
      });
    }
    next();
  },
];

// Password Change Validation
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('New password must contain at least one number'),

  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }
      return true;
    }),

  // Validation Result Handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg
        }))
      });
    }
    next();
  },
];

// Helper function to create a reusable validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  }
  next();
};

export {
  handleValidationErrors
};

