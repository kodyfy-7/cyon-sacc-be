/* eslint-disable consistent-return */
const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map((err) => ({
    param: err.param,
    message: err.msg
  }));

  return res.status(422).json({
    errors: extractedErrors,
    message: "Validation failed. Please check the provided data."
  });
};

const okvalidate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(422).json({ errors: errors.array() });
  };
};

const validateCreateEvent = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isString()
      .withMessage("Name must be a string"),

    body("fileUrl")
      .optional({ nullable: true })
      .isString()
      .withMessage("File URL must be a string"),

    body("description")
      .optional({ nullable: true })
      .isString()
      .withMessage("Description must be a string")
  ];
};

const validateUpdateEvent = () => {
  return [
    body("name")
      .optional({ nullable: true })
      .isString()
      .withMessage("Name must be a string"),

    body("fileUrl")
      .optional({ nullable: true })
      .isString()
      .withMessage("File URL must be a string"),

    body("description")
      .optional({ nullable: true })
      .isString()
      .withMessage("Description must be a string")
  ];
};

const validateRegister = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isString()
      .withMessage("Name must be a string"),

    body("email")
      .optional({ nullable: true, checkFalsy: true })
      .isEmail()
      .withMessage("Email must be a valid email address")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),

    body("phoneNumber")
      .notEmpty()
      .withMessage("Phone number is required")
      .isString()
      .withMessage("Phone number must be a string"),

    body("gender")
      .notEmpty()
      .withMessage("Gender is required")
      .isString()
      .withMessage("Gender must be a string"),

    body("outstation")
      .optional({ nullable: true })
      .isString()
      .withMessage("Outstation must be a string"),

    body("dateOfBirth")
      .notEmpty()
      .withMessage("Date of birth is required")
      .isDate()
      .withMessage("Date of birth must be a valid date (YYYY-MM-DD)")
  ];
};

const validateLogin = () => {
  return [
    body("email")
      .optional({ nullable: true, checkFalsy: true })
      .isEmail()
      .withMessage("Email must be a valid email address")
      .normalizeEmail(),

    body("phoneNumber")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage("Phone number must be a string"),

    body().custom((value) => {
      if (!value.email && !value.phoneNumber) {
        throw new Error("Either email or phoneNumber is required");
      }
      return true;
    }),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
  ];
};

const validateRefreshToken = () => {
  return [
    body("refreshToken")
      .notEmpty()
      .withMessage("Refresh token is required")
      .isString()
      .withMessage("Refresh token must be a string")
  ];
};

const validateCreateMember = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isString()
      .withMessage("Name must be a string"),

    body("email")
      .optional({ nullable: true, checkFalsy: true })
      .isEmail()
      .withMessage("Email must be a valid email address")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),

    body("phoneNumber")
      .notEmpty()
      .withMessage("Phone number is required")
      .isString()
      .withMessage("Phone number must be a string"),

    body("gender")
      .notEmpty()
      .withMessage("Gender is required")
      .isString()
      .withMessage("Gender must be a string"),

    body("outstation")
      .optional({ nullable: true })
      .isString()
      .withMessage("Outstation must be a string"),

    body("dateOfBirth")
      .notEmpty()
      .withMessage("Date of birth is required")
      .isDate()
      .withMessage("Date of birth must be a valid date (YYYY-MM-DD)")
  ];
};

const validateUpdateMember = () => {
  return [
    body("name")
      .optional({ nullable: true })
      .isString()
      .withMessage("Name must be a string"),

    body("phoneNumber")
      .optional({ nullable: true })
      .isString()
      .withMessage("Phone number must be a string"),

    body("gender")
      .optional({ nullable: true })
      .isString()
      .withMessage("Gender must be a string"),

    body("outstation")
      .optional({ nullable: true })
      .isString()
      .withMessage("Outstation must be a string"),

    body("dateOfBirth")
      .optional({ nullable: true })
      .isDate()
      .withMessage("Date of birth must be a valid date (YYYY-MM-DD)"),

    body("isActive")
      .optional({ nullable: true })
      .isBoolean()
      .withMessage("isActive must be a boolean")
  ];
};

const validateMakeAdmin = () => {
  return [
    body("positionId")
      .notEmpty()
      .withMessage("Position ID is required")
      .isUUID()
      .withMessage("Position ID must be a valid UUID"),

    body("isSuper")
      .optional({ nullable: true })
      .isBoolean()
      .withMessage("isSuper must be a boolean")
  ];
};

const validateCreatePosition = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("Position name is required")
      .isString()
      .withMessage("Position name must be a string")
  ];
};

const validateUpdatePosition = () => {
  return [
    body("name")
      .optional({ nullable: true })
      .isString()
      .withMessage("Position name must be a string")
  ];
};

const validateContactUs = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isString()
      .withMessage("Name must be a string"),

    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email must be a valid email address")
      .normalizeEmail(),

    body("phoneNumber")
      .optional({ nullable: true })
      .isString()
      .withMessage("Phone number must be a string"),

    body("subject")
      .notEmpty()
      .withMessage("Subject is required")
      .isString()
      .withMessage("Subject must be a string"),

    body("message")
      .notEmpty()
      .withMessage("Message is required")
      .isString()
      .withMessage("Message must be a string")
  ];
};

const validateCreateProgramYear = () => {
  return [
    body("year")
      .notEmpty()
      .withMessage("Year is required")
      .isInt({ min: 2000, max: 2100 })
      .withMessage("Year must be a valid 4-digit integer"),

    body("theme")
      .optional({ nullable: true })
      .isString()
      .withMessage("Theme must be a string")
  ];
};

const validateUpdateProgramYear = () => {
  return [
    body("year")
      .optional({ nullable: true })
      .isInt({ min: 2000, max: 2100 })
      .withMessage("Year must be a valid 4-digit integer"),

    body("theme")
      .optional({ nullable: true })
      .isString()
      .withMessage("Theme must be a string")
  ];
};

const validateCreateActivity = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("Activity name is required")
      .isString()
      .withMessage("Activity name must be a string"),

    body("sn")
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage("sn must be a positive integer"),

    body("eventDate")
      .optional({ nullable: true })
      .isString()
      .withMessage("eventDate must be a string"),

    body("level")
      .optional({ nullable: true })
      .isString()
      .withMessage("Level must be a string"),

    body("venue")
      .optional({ nullable: true })
      .isString()
      .withMessage("Venue must be a string")
  ];
};

const validateUpdateActivity = () => {
  return [
    body("name")
      .optional({ nullable: true })
      .isString()
      .withMessage("Activity name must be a string"),

    body("sn")
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage("sn must be a positive integer"),

    body("eventDate")
      .optional({ nullable: true })
      .isString()
      .withMessage("eventDate must be a string"),

    body("level")
      .optional({ nullable: true })
      .isString()
      .withMessage("Level must be a string"),

    body("venue")
      .optional({ nullable: true })
      .isString()
      .withMessage("Venue must be a string")
  ];
};

module.exports = {
  validate,
  okvalidate,
  validateCreateEvent,
  validateUpdateEvent,
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateCreateMember,
  validateUpdateMember,
  validateMakeAdmin,
  validateCreatePosition,
  validateUpdatePosition,
  validateContactUs,
  validateCreateProgramYear,
  validateUpdateProgramYear,
  validateCreateActivity,
  validateUpdateActivity
};
