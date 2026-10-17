import { useAuth } from "@clerk/expo";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  const { signOut } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignOut() {
    setErrorMessage("");

    try {
      await signOut();
    } catch {
      setErrorMessage("Unable to sign out. Please try again.");
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-background px-7">
      <Text className="font-poppins-bold text-h2 text-text-primary">You're signed in!</Text>
      <Text className="mt-3 text-center font-poppins text-[16px] text-text-secondary">
        Your account is ready. Let’s start learning.
      </Text>

      {errorMessage ? (
        <Text accessibilityRole="alert" className="mt-5 font-poppins text-[14px] text-[#D92D20]">
          {errorMessage}
        </Text>
      ) : null}

      <Pressable
        onPress={() => void handleSignOut()}
        className="mt-8 rounded-2xl bg-brand-purple px-8 py-4"
        accessibilityRole="button"
      >
        <Text className="font-poppins-semibold text-[17px] text-white">Sign Out</Text>
      </Pressable>
    </View>
  );
}
