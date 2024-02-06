// Fuctory Functions
export const handleValidationErrors = (error, res) => {
  res.status(400).json({
    error: error.details[0].message,
  });
};

export const handleMissingParamsError = (error, res) => {
  res.status(100).json({
    error: "Missing URL parameter",
  });
};

export const handleServerError = (error, res) => {
  res.status(500).json({
    error: `Internal Server Error: ${error.message}`,
  });
};

// TryCatchWrapper factory function
export const tryCatchWrapper = async (handler, req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    handleServerError(error, res);
  }
};

// User Factory Functions
export const handleInvalidUser = (res) => {
  res.status(401).json({
    message: "User account not found.Contact Admin.",
  });
};

export const handleUserNotFound = (res) => {
  res.status(404).json({
    message: "User not found.",
  });
};

export const handleWrongCredentials = (res) => {
  res.status(401).json({
    message: "Wrong credentials.",
  });
};

export const handleUserExists = (res) => {
  res.status(409).json({
    message: "User already exists with the same email.",
  });
};
