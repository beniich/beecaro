const { z } = require('zod');

const signupSchema = z.object({
  email: z.string().email('Email invalide').toLowerCase().trim(),
  password: z.string().min(12, 'Le mot de passe doit faire au moins 12 caractères').max(128).optional(),
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  fullName: z.string().min(1).max(200).trim().optional(),
  firebaseUid: z.string().optional(),
  invitationToken: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email invalide').toLowerCase().trim(),
  password: z.string().min(1, 'Mot de passe requis'),
});

const firebaseLoginSchema = z.object({
  idToken: z.string().min(1, 'Token Firebase manquant'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token manquant'),
});

module.exports = {
  signupSchema,
  loginSchema,
  firebaseLoginSchema,
  refreshSchema
};
