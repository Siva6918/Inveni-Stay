import { AuthUser, AuthState } from '../types';
import { awsConfig } from '../config/awsConfig';
import { apiClient } from './apiClient';

const USER_STORAGE_KEY = 'inveni_auth_user';

type AuthListener = (state: AuthState) => void;

export class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: Set<AuthListener> = new Set();
  private isLoading: boolean = false;

  constructor() {
    this.restoreSession();
  }

  private getStorage(key: string): string | null {
    if (typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  private setStorage(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        // ignore
      }
    }
  }

  private removeStorage(key: string): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // ignore
      }
    }
  }

  private restoreSession(): void {
    try {
      const stored = this.getStorage(USER_STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
        if (this.currentUser?.token) {
          apiClient.setToken(this.currentUser.token);
        }
      } else {
        // Initial visitors start in public discovery mode (unauthenticated)
        this.currentUser = null;
      }
    } catch (e) {
      this.currentUser = null;
    }
  }

  public getAuthState(): AuthState {
    return {
      isAuthenticated: Boolean(this.currentUser),
      user: this.currentUser,
      isLoading: this.isLoading,
      isDemoMode: awsConfig.isDemoMode,
    };
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    listener(this.getAuthState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const state = this.getAuthState();
    this.listeners.forEach((l) => l(state));
  }

  /**
   * Sign In with Email & Password
   */
  public async login(
    email: string,
    password?: string
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    this.isLoading = true;
    this.notify();

    if (awsConfig.isCloudBackendConfigured) {
      // Live Amazon Cognito Authentication Flow
      try {
        const res = await apiClient.post('/api/auth/login', { email, password });
        this.isLoading = false;

        if (res.success && res.data?.user) {
          const user: AuthUser = {
            id: res.data.user.id || res.data.user.sub,
            email: res.data.user.email,
            fullName: res.data.user.name || res.data.user.fullName,
            phone: res.data.user.phone_number || res.data.user.phone || '',
            currentLocation: res.data.user.currentLocation || '',
            occupation: res.data.user.occupation || '',
            isDemoUser: false,
            token: res.data.token,
          };
          this.currentUser = user;
          this.setStorage(USER_STORAGE_KEY, JSON.stringify(user));
          apiClient.setToken(user.token || null);
          this.notify();
          return { success: true, user };
        } else {
          this.notify();
          return {
            success: false,
            error: res.error?.message || 'Incorrect email or password.',
          };
        }
      } catch (err: any) {
        this.isLoading = false;
        this.notify();
        return {
          success: false,
          error: 'Cognito authentication service unreachable. Switched to fallback.',
        };
      }
    }

    // Controlled Demo Mode Login
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.isLoading = false;

    const trimmed = email.trim().toLowerCase();
    const isOwnerLogin = trimmed.includes('owner') || trimmed.includes('reddy') || trimmed.includes('srisai');
    const demoUser: AuthUser = {
      id: isOwnerLogin ? 'owner_sri_sai_panyam' : `usr_${Date.now().toString(36)}`,
      email: trimmed || 'siva.reddy@gmail.com',
      fullName: isOwnerLogin
        ? 'Rameshwar Reddy (Property Owner)'
        : trimmed.includes('kumar')
        ? 'Siva Kumar'
        : 'Verified Renter',
      phone: '9849012345',
      currentLocation: 'Panyam, Andhra Pradesh',
      occupation: isOwnerLogin ? 'Property Host & Owner' : 'Student / Professional',
      isDemoUser: true,
      role: isOwnerLogin ? 'owner' : 'renter',
      token: `demo-token-${Date.now()}`,
    };

    this.currentUser = demoUser;
    this.setStorage(USER_STORAGE_KEY, JSON.stringify(demoUser));
    apiClient.setToken(demoUser.token || null);
    this.notify();

    return { success: true, user: demoUser };
  }

  private pendingAction: PendingAction | null = null;

  public setPendingAction(action: PendingAction | null): void {
    this.pendingAction = action;
  }

  public getPendingAction(): PendingAction | null {
    return this.pendingAction;
  }

  public clearPendingAction(): void {
    this.pendingAction = null;
  }

  /**
   * Quick Switch / Demo Personas for Evaluators
   */
  public loginAsDemoUser(persona: 'student' | 'professional' | 'owner' | 'owner_b' = 'student'): AuthUser {
    let user: AuthUser;

    if (persona === 'student') {
      user = {
        id: 'usr_panyam_student_01',
        email: 'siva.reddy@gmail.com',
        fullName: 'Venkata Siva Kumar',
        phone: '9849012345',
        currentLocation: 'Kadapa, Andhra Pradesh',
        occupation: 'Student (Polytechnic Engineering)',
        isDemoUser: true,
        role: 'renter',
        token: 'demo-jwt-student-01',
      };
    } else if (persona === 'professional') {
      user = {
        id: 'usr_panyam_pro_02',
        email: 'ananya.sharma@tcs.com',
        fullName: 'Ananya Sharma',
        phone: '9876543210',
        currentLocation: 'Bengaluru, Karnataka',
        occupation: 'Software Engineer',
        isDemoUser: true,
        role: 'renter',
        token: 'demo-jwt-pro-02',
      };
    } else if (persona === 'owner_b') {
      // Owner B Persona: Lakshmi Narayana (Owner of Lakshmi Residency, Nandyal)
      user = {
        id: 'owner_lakshmi_nandyal',
        email: 'lakshmi.narayana@lakshmiresidency.in',
        fullName: 'Lakshmi Narayana',
        phone: '9441234567',
        currentLocation: 'Nandyal, Andhra Pradesh',
        occupation: 'Property Host & Owner',
        isDemoUser: true,
        role: 'owner',
        token: 'demo-jwt-owner-lakshmi-02',
      };
    } else {
      // Owner Persona: Rameshwar Reddy (Owner of Sri Sai Luxury PG & Residency, Panyam)
      user = {
        id: 'owner_sri_sai_panyam',
        email: 'rameshwar.reddy@srisairesidency.in',
        fullName: 'Rameshwar Reddy',
        phone: '9848099887',
        currentLocation: 'Panyam, Andhra Pradesh',
        occupation: 'Property Host & Owner',
        isDemoUser: true,
        role: 'owner',
        token: 'demo-jwt-owner-sri-sai-01',
      };
    }

    this.currentUser = user;
    this.setStorage(USER_STORAGE_KEY, JSON.stringify(user));
    apiClient.setToken(user.token || null);
    this.notify();
    return user;
  }

  public isOwner(): boolean {
    return this.currentUser?.role === 'owner' || (this.currentUser?.id?.startsWith('owner_') ?? false);
  }

  public getCurrentOwnerId(): string {
    return this.currentUser?.id || 'owner_sri_sai_panyam';
  }

  /**
   * Sign Up
   */
  public async signup(data: {
    email: string;
    fullName: string;
    phone: string;
    currentLocation: string;
    occupation: string;
    password?: string;
    role?: 'renter' | 'owner';
  }): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    this.isLoading = true;
    this.notify();

    if (awsConfig.isCloudBackendConfigured) {
      const res = await apiClient.post('/api/auth/signup', data);
      this.isLoading = false;
      this.notify();
      if (res.success && res.data?.user) {
        return { success: true, user: res.data.user };
      }
      return { success: false, error: res.error?.message || 'Registration failed.' };
    }

    // Demo Mode Sign Up
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.isLoading = false;

    const isOwner = data.role === 'owner' || data.email.toLowerCase().includes('owner');
    const newUser: AuthUser = {
      id: isOwner ? `owner_${Date.now().toString(36)}` : `usr_${Date.now().toString(36)}`,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      currentLocation: data.currentLocation,
      occupation: data.occupation,
      isDemoUser: true,
      role: isOwner ? 'owner' : 'renter',
      token: `demo-token-${Date.now()}`,
    };

    this.currentUser = newUser;
    this.setStorage(USER_STORAGE_KEY, JSON.stringify(newUser));
    apiClient.setToken(newUser.token || null);
    this.notify();

    return { success: true, user: newUser };
  }


  /**
   * Sign Out
   */
  public logout(): void {
    this.currentUser = null;
    this.removeStorage(USER_STORAGE_KEY);
    apiClient.setToken(null);
    this.notify();
  }
}

export interface PendingAction {
  type: 'reserve' | 'owner_dashboard' | 'list_property';
  propertyId?: string;
  roomId?: string;
}

export const authService = new AuthService();
