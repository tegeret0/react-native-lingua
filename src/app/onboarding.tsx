import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

import { images } from "../../constants/images";

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View className="flex-1 px-7">
        <View className="mt-7 flex-row items-center justify-center gap-3">
          <Image source={images.mascotLogo} className="h-14 w-14" resizeMode="contain" />
          <Text className="font-poppins-bold text-[32px] text-text-primary">muolingo</Text>
        </View>

        <View className="mt-14">
          <Text className="font-poppins-semibold text-[34px] leading-[1.25] text-text-primary">
            Your AI language{"\n"}
            <Text className="text-brand-purple">teacher.</Text>
          </Text>
          <Text className="mt-4 font-poppins text-[17px] leading-[1.65] text-text-secondary">
            Real conversations, personalized{"\n"}lessons, anytime, anywhere.
          </Text>
        </View>

        <View className="relative mt-5 min-h-0 flex-1 items-center justify-center">
          <View className="absolute left-1 top-[12%] -rotate-[8deg] rounded-[20px] bg-[#EEF6FF] px-5 py-3">
            <Text className="font-poppins-medium text-[22px] text-text-primary">Hello!</Text>
          </View>
          <View className="absolute right-2 top-[8%] rotate-[10deg] rounded-[20px] bg-[#F7F5FF] px-5 py-3">
            <Text className="font-poppins-semibold text-[21px] italic text-brand-purple">¡Hola!</Text>
          </View>
          <View className="absolute right-0 top-[37%] rotate-[8deg] rounded-[20px] bg-[#FFF3EE] px-5 py-3">
            <Text className="font-poppins-semibold text-[21px] text-[#F04438]">你好!</Text>
          </View>
          <Image
            source={images.mascotWelcome}
            className="h-[88%] w-full"
            resizeMode="contain"
          />
        </View>

        <Link href="/sign-up" asChild>
          <Pressable style={styles.startButton}>
            <Text className="font-poppins-semibold text-[20px] text-white">Get Started　›</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  startButton: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    borderRadius: 24,
    backgroundColor: "#6C4EF5",
    paddingVertical: 20,
  },
});
