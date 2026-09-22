/**
 * AWS Lambda Handler: Auth API (Sign Up and Sign In via Amazon Cognito)
 * Runtime: Node.js 20.x (TypeScript)
 * Event: API Gateway HTTP API v2 Proxy Event
 *
 * Routes:
 *   POST /api/auth/signup      - Register a new user in Cognito + store profile in DynamoDB
 *   POST /api/auth/login       - Authenticate with Cognito, return JWT tokens
 *   POST /api/auth/verify      - Confirm signup with OTP code sent to email
 *   POST /api/auth/resend-code - Resend the OTP verification code
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  InitiateAuthCommand,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';

const REGION = process.env.AWS_REGION || 'ap-south-1';
const TABLE_NAME = process.env.TABLE_NAME || 'InveniStayData';
const CLIENT_ID = process.env.COGNITO_CLIENT_ID || '';

const dynamoClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: { removeUndefinedValues: true },
});
const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
};

function ok(data: any, statusCode = 200) {
  return { statusCode, headers, body: JSON.stringify({ success: true, data }) };
}

function fail(message: string, code = 'AUTH_ERROR', statusCode = 400) {
  return { statusCode, headers, body: JSON.stringify({ success: false, error: { code, message } }) };
}

export const handler = async (event: any): Promise<any> => {
  const method = (event.requestContext?.http?.method || event.httpMethod || 'GET').toUpperCase();
  const path = event.rawPath || event.path || '';

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let body: any = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return fail('Invalid request body.', 'INVALID_BODY', 400);
  }

  // POST /api/auth/signup
  if (method === 'POST' && path.endsWith('/auth/signup')) {
    const { email, password, fullName, phone, role = 'renter' } = body;

    if (!email || !password || !fullName) {
      return fail('email, password, and fullName are required.', 'VALIDATION_ERROR', 400);
    }

    try {
      const signUpResult = await cognitoClient.send(
        new SignUpCommand({
          ClientId: CLIENT_ID,
          Username: email.toLowerCase().trim(),
          Password: password,
          UserAttributes: [
            { Name: 'email', Value: email.toLowerCase().trim() },
            { Name: 'name', Value: fullName.trim() },
            ...(phone ? [{ Name: 'phone_number', Value: phone.startsWith('+') ? phone : '+91' + phone }] : []),
          ],
        })
      );

      const userId = signUpResult.UserSub || ('usr_' + Date.now());
      const now = new Date().toISOString();

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: 'USER#' + userId,
            SK: 'PROFILE',
            GSI1PK: 'EMAIL#' + email.toLowerCase().trim(),
            GSI1SK: now,
            userId,
            email: email.toLowerCase().trim(),
            fullName: fullName.trim(),
            phone: phone || '',
            role,
            createdAt: now,
            updatedAt: now,
            emailVerified: false,
          },
          ConditionExpression: 'attribute_not_exists(PK)',
        })
      );

      return ok({
        user: { id: userId, email: email.toLowerCase().trim(), fullName: fullName.trim(), phone: phone || '', role },
        message: 'Account created! Please verify your email before signing in.',
        requiresVerification: true,
      }, 201);
    } catch (e: any) {
      const code = e?.name || e?.code || 'SIGNUP_ERROR';
      if (code === 'UsernameExistsException') return fail('An account with this email already exists.', 'EMAIL_EXISTS', 409);
      if (code === 'InvalidPasswordException') return fail('Password must be 8+ characters with at least 1 number and 1 lowercase letter.', 'INVALID_PASSWORD', 400);
      if (code === 'InvalidParameterException') return fail(e.message || 'Invalid parameters.', 'INVALID_PARAM', 400);
      console.error('[auth/signup]', e);
      return fail('Signup failed. Please try again.', code, 500);
    }
  }

  // POST /api/auth/login
  if (method === 'POST' && path.endsWith('/auth/login')) {
    const { email, password } = body;

    if (!email || !password) {
      return fail('email and password are required.', 'VALIDATION_ERROR', 400);
    }

    try {
      const authResult = await cognitoClient.send(
        new InitiateAuthCommand({
          AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
          ClientId: CLIENT_ID,
          AuthParameters: { USERNAME: email.toLowerCase().trim(), PASSWORD: password },
        })
      );

      const tokens = authResult.AuthenticationResult;
      if (!tokens?.IdToken) return fail('Authentication failed.', 'AUTH_FAILED', 401);

      const [, payloadB64] = tokens.IdToken.split('.');
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf-8'));
      const userId = payload.sub;

      let profile: any = {};
      try {
        const profileRes = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: 'USER#' + userId, SK: 'PROFILE' } }));
        profile = profileRes.Item || {};
      } catch { /* non-fatal */ }

      return ok({
        user: {
          id: userId,
          email: payload.email || email.toLowerCase().trim(),
          fullName: profile.fullName || payload.name || '',
          phone: profile.phone || payload.phone_number || '',
          role: profile.role || 'renter',
          emailVerified: payload.email_verified === true || payload.email_verified === 'true',
        },
        token: tokens.IdToken,
        accessToken: tokens.AccessToken,
        refreshToken: tokens.RefreshToken,
        expiresIn: tokens.ExpiresIn,
      });
    } catch (e: any) {
      const code = e?.name || e?.code || 'LOGIN_ERROR';
      if (code === 'NotAuthorizedException') return fail('Incorrect email or password.', 'INVALID_CREDENTIALS', 401);
      if (code === 'UserNotConfirmedException') return fail('Please verify your email before signing in.', 'EMAIL_NOT_VERIFIED', 403);
      if (code === 'UserNotFoundException') return fail('No account found with this email. Please sign up first.', 'USER_NOT_FOUND', 404);
      if (code === 'PasswordResetRequiredException') return fail('Your password needs to be reset.', 'PASSWORD_RESET_REQUIRED', 403);
      if (code === 'TooManyRequestsException') return fail('Too many attempts. Please wait and try again.', 'RATE_LIMITED', 429);
      console.error('[auth/login]', e);
      return fail('Login failed. Please try again.', code, 500);
    }
  }

  // POST /api/auth/verify — Confirm OTP sent to email after signup
  if (method === 'POST' && path.endsWith('/auth/verify')) {
    const { email, code } = body;
    if (!email || !code) {
      return fail('email and code are required.', 'VALIDATION_ERROR', 400);
    }
    try {
      await cognitoClient.send(
        new ConfirmSignUpCommand({
          ClientId: CLIENT_ID,
          Username: email.toLowerCase().trim(),
          ConfirmationCode: code.trim(),
        })
      );
      return ok({ message: 'Email verified successfully! You can now sign in.' });
    } catch (e: any) {
      const code2 = e?.name || e?.code || 'VERIFY_ERROR';
      if (code2 === 'CodeMismatchException') return fail('Invalid verification code. Please check your email and try again.', 'INVALID_CODE', 400);
      if (code2 === 'ExpiredCodeException') return fail('This code has expired. Please request a new one.', 'EXPIRED_CODE', 400);
      if (code2 === 'NotAuthorizedException') return fail('This account is already verified. Please sign in.', 'ALREADY_VERIFIED', 400);
      if (code2 === 'UserNotFoundException') return fail('No account found with this email.', 'USER_NOT_FOUND', 404);
      console.error('[auth/verify]', e);
      return fail('Verification failed. Please try again.', code2, 500);
    }
  }

  // POST /api/auth/resend-code — Resend OTP verification email
  if (method === 'POST' && path.endsWith('/auth/resend-code')) {
    const { email } = body;
    if (!email) return fail('email is required.', 'VALIDATION_ERROR', 400);
    try {
      await cognitoClient.send(
        new ResendConfirmationCodeCommand({
          ClientId: CLIENT_ID,
          Username: email.toLowerCase().trim(),
        })
      );
      return ok({ message: 'Verification code resent. Please check your email inbox.' });
    } catch (e: any) {
      const code2 = e?.name || e?.code || 'RESEND_ERROR';
      if (code2 === 'UserNotFoundException') return fail('No account found with this email.', 'USER_NOT_FOUND', 404);
      if (code2 === 'InvalidParameterException') return fail('This account is already verified.', 'ALREADY_VERIFIED', 400);
      if (code2 === 'LimitExceededException') return fail('Too many requests. Please wait a moment before trying again.', 'RATE_LIMITED', 429);
      console.error('[auth/resend-code]', e);
      return fail('Failed to resend code. Please try again.', code2, 500);
    }
  }

  return fail('Route not found: ' + method + ' ' + path, 'NOT_FOUND', 404);
};
