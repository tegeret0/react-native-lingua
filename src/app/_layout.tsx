import "../../global.css";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Redirect, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

void SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
  });

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AppRoutes fontsLoaded={fontsLoaded || Boolean(fontError)} />
    </ClerkProvider>
  );
}

function AppRoutes({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const currentRoute = segments[0];
  const isPublicRoute =
    currentRoute === "onboarding" ||
    currentRoute === "sign-in" ||
    currentRoute === "sign-up";

  useEffect(() => {
    if (fontsLoaded && isLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoaded]);

  if (!fontsLoaded || !isLoaded) {
    return null;
  }

  if (!isSignedIn && !isPublicRoute) {
    return <Redirect href="/onboarding" />;
  }

  if (isSignedIn && isPublicRoute) {
    return <Redirect href="/" />;
  }

  return <Stack />;
}
