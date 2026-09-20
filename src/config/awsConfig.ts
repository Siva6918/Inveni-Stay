/**
 * Centralized AWS Configuration Module
 * Manages AWS regions, API Gateway endpoints, Cognito IDs, and Demo Mode detection.
 * Never stores secret keys or tokens.
 */

export interface AWSConfiguration {
  region: string;
  apiBaseUrl: string;
  cognitoUserPoolId: string;
  cognitoClientId: string;
  isCloudBackendConfigured: boolean;
  isDemoMode: boolean;
}

const env = (import.meta as any).env || {};

const apiBaseUrl = env.VITE_API_BASE_URL || '';
const cognitoUserPoolId = env.VITE_COGNITO_USER_POOL_ID || '';
const cognitoClientId = env.VITE_COGNITO_CLIENT_ID || '';
const useCloudFlag = env.VITE_USE_CLOUD_BACKEND === 'true';

const isCloudBackendConfigured = Boolean(
  useCloudFlag && apiBaseUrl && cognitoUserPoolId && cognitoClientId
);

export const awsConfig: AWSConfiguration = {
  region: env.VITE_AWS_REGION || 'ap-south-1',
  apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
  cognitoUserPoolId,
  cognitoClientId,
  isCloudBackendConfigured,
  isDemoMode: !isCloudBackendConfigured,
};
