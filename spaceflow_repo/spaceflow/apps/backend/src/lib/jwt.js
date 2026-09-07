const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { prisma } = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "test-secret-32-chars-minimum-required-yes";
const ACCESS_TOKEN_EXPIRATION = "15m";

const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRATION }
  );

  const refreshToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt
    }
  });

  return { accessToken, refreshToken };
};

const verifyToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("[JWT] Token verification failed:", error.message);
    return null;
  }
};

module.exports = { verifyToken, generateTokens };
