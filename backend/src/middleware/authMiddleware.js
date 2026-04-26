import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: "Server misconfiguration" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized — no token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized — malformed token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });

    if (!decoded.userId) {
      return res.status(401).json({ success: false, message: "Not authorized — invalid token payload" });
    }

    req.user = { userId: decoded.userId.toString() };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired — please refresh" });
    }
    return res.status(401).json({ success: false, message: "Not authorized — invalid token" });
  }
};
