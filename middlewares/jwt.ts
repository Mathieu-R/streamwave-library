import jwt from "express-jwt";

export jwt({
  secret: process.env.JWT_SECRET
});
