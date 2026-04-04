import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { workoutService } from '../services/workoutService';
import { loginAttemptService } from '../services/loginAttemptService';
import { hashPassword, verifyPassword, generateSecureToken } from '../utils/cryptoHelpers';
import { useToastContext } from './ToastContext';

interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; attemptsLeft?: number }>;
  signInWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; message: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const ensureUserProfile = async (
  authUserId: string,
  email: string,
  name?: string
): Promise<{
  id: string;
  email: string;
  username: string;
  created_at: string;
} | null> => {
  if (!supabase) return null;

  try {
    const { data: existingProfile, error: fetchError } = await supabase
      .from('users')
      .select('id, email, username, created_at')
      .eq('id', authUserId)
      .single();

    if (existingProfile) {
      await ensureUserProgression(authUserId);
      return existingProfile;
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Profile fetch error:', fetchError);
    }

    const baseUsername = name || email.split('@')[0];

    // Try inserting with the base username, then fall back to appending a random suffix
    // to handle UNIQUE constraint conflicts (e.g. two Google users with same email prefix).
    let newProfile = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const username = attempt === 0 ? baseUsername : `${baseUsername}${Math.floor(Math.random() * 9000) + 1000}`;
      const { data, error: insertError } = await supabase
        .from('users')
        .insert({ id: authUserId, username, email })
        .select('id, email, username, created_at')
        .single();

      if (!insertError) {
        newProfile = data;
        break;
      }

      // 23505 = unique_violation; retry with different username
      if (insertError.code !== '23505') {
        console.error('Failed to create user profile:', insertError);
        break;
      }
    }

    if (!newProfile) return null;

    await ensureUserProgression(authUserId);

    return newProfile;
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    return null;
  }
};

const ensureUserProgression = async (userId: string): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const { data: existing } = await supabase
      .from('user_progression')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      return true;
    }

    const { error: insertError } = await supabase.from('user_progression').insert({
      user_id: userId,
      current_week: 1,
      completed_days: [],
    });

    if (insertError) {
      console.error('Failed to create progression:', insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in ensureUserProgression:', error);
    return false;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToastContext();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const buildUserFromProfile = (profile: {
    id: string;
    email: string;
    username: string;
    created_at: string;
  }): User => ({
    id: profile.id,
    email: profile.email,
    name: profile.username,
    username: profile.username,
    createdAt: profile.created_at,
  });

  useEffect(() => {
    let isMounted = true;

    const handleSession = async (sessionUser: { id: string; email?: string; user_metadata?: Record<string, string> } | null) => {
      if (!isMounted) return;

      if (sessionUser) {
        const displayName = sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name;
        const profile = await ensureUserProfile(sessionUser.id, sessionUser.email || '', displayName);
        if (!isMounted) return;

        if (profile) {
          const userData = buildUserFromProfile(profile);
          setUser(userData);
          localStorage.setItem('currentUser', JSON.stringify(userData));
        } else {
          // Profile DB write failed but auth session is valid — build a minimal user
          // so the user isn't stuck on the landing page. They can retry later.
          const fallback: User = {
            id: sessionUser.id,
            email: sessionUser.email || '',
            name: (sessionUser.email || '').split('@')[0],
            username: (sessionUser.email || '').split('@')[0],
            createdAt: new Date().toISOString(),
          };
          setUser(fallback);
          localStorage.setItem('currentUser', JSON.stringify(fallback));
        }
      } else {
        setUser(null);
        localStorage.removeItem('currentUser');
      }

      if (isMounted) setIsLoading(false);
    };

    if (supabase) {
      // Listen for auth state changes (handles OAuth redirects, token refresh, sign out)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        handleSession(session?.user ?? null);
      });

      // Also check immediately in case there's already a session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          // No Supabase session — fall back to localStorage
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser && isMounted) {
            try {
              const parsed = JSON.parse(savedUser);
              setUser(parsed);
            } catch {
              localStorage.removeItem('currentUser');
            }
          }
          if (isMounted) setIsLoading(false);
        }
        // If there IS a session, onAuthStateChange will fire and handleSession runs
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    // Supabase not configured — localStorage only
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);

    return () => {
      isMounted = false;
    };
  }, []);

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      if (supabase) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
          });

          if (authError) {
            console.error('Supabase signup error:', authError);
            toast.error(authError.message);
            return false;
          }

          if (authData.user) {
            const profile = await ensureUserProfile(authData.user.id, email, name);

            if (!profile) {
              console.error('Profile creation failed after auth signup');
              try {
                await supabase.auth.signOut();
              } catch (cleanupError) {
                console.error('Failed to cleanup orphaned auth:', cleanupError);
              }
              toast.error('Failed to create user profile. Please try again.');
              return false;
            }

            const userData = buildUserFromProfile(profile);
            setUser(userData);
            localStorage.setItem('currentUser', JSON.stringify(userData));

            return true;
          }
        } catch (error) {
          console.error('Supabase signup error:', error);
        }
      }

      const usersJson = localStorage.getItem('users');
      const users: Array<User & { password: string }> = usersJson ? JSON.parse(usersJson) : [];

      if (users.find((u) => u.email === email)) {
        toast.error('Email already registered!');
        return false;
      }

      const passwordHash = await hashPassword(password);

      const newUser: User & { password: string } = {
        id: Date.now().toString(),
        email,
        name,
        username: name,
        password: passwordHash,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      const userWithoutPassword: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
        createdAt: newUser.createdAt,
      };

      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed! Please try again.');
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string; attemptsLeft?: number }> => {
    try {
      if (loginAttemptService.isAccountLocked(email)) {
        const lockTime = loginAttemptService.getRemainingLockTime(email);
        return {
          success: false,
          message: `Account locked due to too many failed login attempts. Please try again in ${lockTime} minutes or reset your password.`,
        };
      }

      if (supabase) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (authError) {
            console.error('Supabase login error:', authError);

            const result = loginAttemptService.recordFailedAttempt(email);

            if (result.locked) {
              return {
                success: false,
                message: `Too many failed attempts. Your account has been locked for ${result.lockTimeMinutes} minutes. A password reset email will be sent to you.`,
              };
            }

            return {
              success: false,
              message: authError.message,
              attemptsLeft: result.attemptsLeft,
            };
          }

          if (authData.user) {
            const profile = await ensureUserProfile(authData.user.id, email);

            if (!profile) {
              console.error('Profile fetch/recovery failed');
              return {
                success: false,
                message: 'Failed to fetch user profile. Please try again or contact support.',
              };
            }

            const userData = buildUserFromProfile(profile);
            loginAttemptService.recordSuccessfulLogin(email);
            setUser(userData);
            localStorage.setItem('currentUser', JSON.stringify(userData));

            return { success: true };
          }
        } catch (error) {
          console.error('Supabase login error:', error);
        }
      }

      const usersJson = localStorage.getItem('users');
      const users: Array<User & { password: string }> = usersJson ? JSON.parse(usersJson) : [];

      const foundUser = users.find((u) => u.email === email);

      const passwordValid = foundUser ? await verifyPassword(password, foundUser.password) : false;

      if (!foundUser || !passwordValid) {
        const result = loginAttemptService.recordFailedAttempt(email);

        if (result.locked) {
          return {
            success: false,
            message: `Too many failed attempts. Your account has been locked for ${result.lockTimeMinutes} minutes. Please reset your password.`,
          };
        }

        return {
          success: false,
          message: `Invalid email or password. ${result.attemptsLeft} attempts remaining.`,
          attemptsLeft: result.attemptsLeft,
        };
      }

      loginAttemptService.recordSuccessfulLogin(email);

      const userWithoutPassword: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        username: foundUser.username || foundUser.name,
        createdAt: foundUser.createdAt,
      };

      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed! Please try again.',
      };
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!supabase) {
        return {
          success: false,
          message: 'Google sign-in requires Supabase configuration. Please check your environment variables.',
        };
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });

      if (error) {
        console.error('Google sign-in error:', error);
        toast.error(error.message);
        return {
          success: false,
          message: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        message: 'Failed to sign in with Google. Please try again.',
      };
    }
  };

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Supabase logout error:', error);
      }
    }

    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (supabase) {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
          });

          if (error) {
            console.error('Supabase password reset error:', error);
            return {
              success: false,
              message: error.message,
            };
          }

          loginAttemptService.unlockAccount(email);

          return {
            success: true,
            message: 'Password reset link has been sent to your email. Please check your inbox.',
          };
        } catch (error) {
          console.error('Supabase password reset error:', error);
        }
      }

      const usersJson = localStorage.getItem('users');
      const users: Array<User & { password: string }> = usersJson ? JSON.parse(usersJson) : [];
      const userExists = users.find((u) => u.email === email);

      if (!userExists) {
        return {
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent to your email.',
        };
      }

      loginAttemptService.unlockAccount(email);

      const resetToken = `reset_${generateSecureToken()}`;
      const resetTokens = JSON.parse(localStorage.getItem('resetTokens') || '{}');
      resetTokens[resetToken] = {
        email,
        expires: new Date(Date.now() + 3600000).toISOString(),
      };
      localStorage.setItem('resetTokens', JSON.stringify(resetTokens));

      return {
        success: true,
        message: 'Password reset instructions have been sent. (In offline mode, check console for reset link)',
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: 'Failed to send password reset email. Please try again.',
      };
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (supabase && user) {
        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });

          if (error) {
            console.error('Supabase password update error:', error);
            return {
              success: false,
              message: error.message,
            };
          }

          return {
            success: true,
            message: 'Password updated successfully!',
          };
        } catch (error) {
          console.error('Supabase password update error:', error);
        }
      }

      if (!user) {
        return {
          success: false,
          message: 'You must be logged in to change your password.',
        };
      }

      const usersJson = localStorage.getItem('users');
      const users: Array<User & { password: string }> = usersJson ? JSON.parse(usersJson) : [];
      const userIndex = users.findIndex((u) => u.id === user.id);

      if (userIndex === -1) {
        return {
          success: false,
          message: 'User not found.',
        };
      }

      users[userIndex].password = await hashPassword(newPassword);
      localStorage.setItem('users', JSON.stringify(users));

      return {
        success: true,
        message: 'Password updated successfully!',
      };
    } catch (error) {
      console.error('Password update error:', error);
      return {
        success: false,
        message: 'Failed to update password. Please try again.',
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signInWithGoogle,
      signup,
      logout,
      resetPassword,
      updatePassword,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
