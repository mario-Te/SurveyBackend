"use strict";
const { verify } = require("jsonwebtoken");
const Variables = require("../config/constants");
const ResponseHelper = require("../helpers/ResponseHelper");

const User = require("../models/userModel");

module.exports = (expectedRoles) => {
  return async (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(403).json({ responseCode: 403, success: false });
    }
    const headerParts = req.headers.authorization.split(" ");
    const prefix = headerParts[0];
    const token = headerParts[1];
    if (prefix !== "Bearer" || !token) {
      return res.status(403).json({ responseCode: 403, success: false });
    }
    let decoded = "";
    try {
      decoded = verify(token, process.env.secret);
    } catch (error) {
      return res.status(403).json({ responseCode: 403, success: false });
    }
    const role = decoded.role;
    const _id = decoded._id;
    if (!role) {
      return res.status(403).json({ responseCode: 403, success: false });
    }
    if (role && expectedRoles.some((scope) => role.indexOf(scope) !== -1)) {
      req._id = _id;
      if (role) {
        req.role = role;
      }

      // check if user still exists in db
      if (role == Variables.Roles.user) {
        const user = await User.findOne({ _id: req._id });
        if (!user) {
          return res.status(403).json({ responseCode: 403, success: false });
        } else {
          req.user = user;
        }
      }

      // check if doctor still exists in db
      if (role == Variables.Roles.admin) {
        const admin = await User.findOne({ _id: req._id });
        if (!admin) {
          return res.status(403).json({ responseCode: 403, success: false });
        } else {
          req.admin = admin;
        }
      }

      next();
    } else {
      return res
        .status(200)
        .json(
          ResponseHelper.badResponse(
            "you don't have permission to do this operation!!"
          )
        );
    }
  };
};
