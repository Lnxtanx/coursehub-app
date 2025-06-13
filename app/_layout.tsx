import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { ThemeProvider } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";

function useProtectedRoute(isLoggedIn: boolean | null) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn === null) {
      // Still loading, don't do anything
      return;
    }

    const inAuthGroup = segments[0] === "auth";
    const isRootPath = segments.length === 0 || (segments.length === 1 && segments[0] === "");

    if (isLoggedIn && (inAuthGroup || isRootPath)) {
      // Redirect logged in users from auth pages or root to dashboard
      router.replace("/course/dashboard");
    } else if (!isLoggedIn && !inAuthGroup && !isRootPath) {
      // Redirect unauthenticated users to login page
      router.replace("/");
    }
  }, [isLoggedIn, segments]);
}

export default function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useProtectedRoute(isLoggedIn);

  useEffect(() => {
    // Check initial auth state
    checkUser();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="course" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="payment" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
