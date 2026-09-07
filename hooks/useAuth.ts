"use client";

import { useEffect, useState, useCallback } from "react";
import { auth } from "@/lib/store";
import type { Session } from "@/lib/types";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    auth.me().then((s) => {
      if (mounted) {
        setSession(s);
        setReady(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await auth.login(email, password);
    if (result.ok) setSession(result.session);
    return result;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await auth.register(name, email, password);
    if (result.ok) setSession(result.session);
    return result;
  }, []);

  const loginAsGuest = useCallback(async () => {
    const s = await auth.loginAsGuest();
    setSession(s);
    return s;
  }, []);

  const logout = useCallback(async () => {
    await auth.logout();
    setSession(null);
  }, []);

  return { session, ready, login, register, loginAsGuest, logout };
}
