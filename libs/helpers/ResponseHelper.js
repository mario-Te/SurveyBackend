const ResponseCode = {
  SUCCESS: 200,
  DATA_MISSED: 420,
  PERMISSION_DENIED: 421,
  UNAUTHENTICATED: 403,
  NOT_FOUND: 404,
  PASSWORD_WRONG: 422,
  USER_NOT_FOUND: 423,
  PHONE_NOT_VALID: 424,
  EMAIL_EXISTS: 425,
  DATA_NOT_VALID: 426,
  DELETED: 427,
  NOT_APPROVED: 428,
  TOO_MANY_REQUESTS: 429,
  EXPIRED: 430,
  DATA_EXISTS: 431,
  VERFIY_CODE_NOT_VALID: 432,
};
function getCode(message) {
  let code = 500;

  try {
    if (message.includes("required")) code = ResponseCode.DATA_MISSED;
    else if (message.includes("user not found"))
      code = ResponseCode.USER_NOT_FOUND;
    else if (message.includes("password is wrong"))
      code = ResponseCode.PASSWORD_WRONG;
    else if (message.includes("not found")) code = ResponseCode.NOT_FOUND;
    else if (message.includes("UNAUTHORIZED"))
      code = ResponseCode.UNAUTHENTICATED;
    else if (message.includes("permission"))
      code = ResponseCode.PERMISSION_DENIED;
    else if (message.includes("phone is invalid"))
      code = ResponseCode.PHONE_NOT_VALID;
    else if (message.includes("email exists")) code = ResponseCode.EMAIL_EXISTS;
    else if (message.includes("code is invalid"))
      code = ResponseCode.VERFIY_CODE_NOT_VALID;
    else if (message.includes("invalid")) code = ResponseCode.DATA_NOT_VALID;
    else if (message.includes("deleted")) code = ResponseCode.DELETED;
    else if (message.includes("expired")) code = ResponseCode.EXPIRED;
    else if (message.includes("not approved")) code = ResponseCode.NOT_APPROVED;
    else if (message.includes("too many requests"))
      code = ResponseCode.TOO_MANY_REQUESTS;
    else if (message.includes("exists")) code = ResponseCode.DATA_EXISTS;
  } catch (error) {}

  return code;
}

module.exports = {
  successResponse: (data, msg) => {
    return {
      responseCode: ResponseCode.SUCCESS,
      success: true,
      message: msg,
      data: data,
      error: null,
    };
  },
  badResponse: (message, error = null, code) => {
    if (typeof message != "string" && error == null) {
      error = message;
      message = "Server Error";
    }
    return {
      responseCode: code || getCode(message),
      success: false,
      message,
      data: null,
      error,
    };
  },
  sleep: (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  },
};
