import { useUser } from "@clerk/expo";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "../../../constants/images";
import { languages } from "../../../data/languages";
import { lessons } from "../../../data/lessons";
import { units } from "../../../data/units";
import { useLanguageStore } from "../../store/language-store";

const dailyXp = 15;
const dailyGoal = 20;

export default function HomeTab() {
  const router = useRouter();
  const { user } = useUser();
  const selectedLanguageId = useLanguageStore((state) => state.selectedLanguageId);
  const language = languages.find((item) => item.id === selectedLanguageId) ?? languages[0];
  const currentLesson = lessons
    .filter((lesson) => lesson.languageId === language.id)
    .sort((first, second) => first.order - second.order)[0];
  const unit = units.find((item) => item.id === currentLesson?.unitId);
  const greetingName = user?.firstName ?? user?.username ?? "there";

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        className="flex-1 px-[22px] pb-3 pt-1.5"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 h-12 flex-row items-center">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FFF4E5]">
            <Text className="text-[24px]">{language.flag}</Text>
          </View>
          <Text numberOfLines={1} className="ml-3 flex-1 font-poppins-semibold text-[17px] text-text-primary">
            Hola, {greetingName}! 👋
          </Text>
          <View className="ml-2 flex-row items-center">
            <Image source={images.streakFire} className="h-7 w-7" resizeMode="contain" />
            <Text className="ml-1 font-poppins-medium text-[16px] text-text-secondary">12</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            className="ml-4 h-10 w-10 items-center justify-center"
          >
            <SymbolView name={{ ios: "bell", android: "notifications_none", web: "notifications_none" }} size={23} tintColor="#182039" />
          </Pressable>
        </View>

        <View className="mb-5 h-[124px] flex-row items-center overflow-hidden rounded-card bg-[#FFF7EC] px-5">
          <View className="flex-1">
            <Text className="font-poppins-medium text-[16px] text-[#344054]">Daily goal</Text>
            <View className="mt-2 flex-row items-baseline">
              <Text className="font-poppins-bold text-[30px] leading-[36px] text-text-primary">{dailyXp}</Text>
              <Text className="ml-2 font-poppins text-[18px] text-text-secondary">/ {dailyGoal} XP</Text>
            </View>
            <View className="mt-3 h-[9px] overflow-hidden rounded-full bg-[#FFE2C3]">
              <View className="h-full rounded-full bg-[#FF8500]" style={{ width: `${(dailyXp / dailyGoal) * 100}%` }} />
            </View>
          </View>
          <Image source={images.treasure} className="ml-4 h-[92px] w-[104px]" resizeMode="contain" />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.navigate("/(tabs)/learn")}
          className="relative mb-6 h-[166px] overflow-hidden rounded-card bg-[#6745F5] px-5 py-4"
        >
          <View className="absolute inset-0 bg-[#704DF5]" />
          <Image source={images.palace} className="absolute -bottom-1 -right-4 h-[158px] w-[196px]" resizeMode="contain" />
          <View className="absolute right-0 top-0 h-full w-1/2 bg-[#7455F5]/35" />
          <View className="z-10 flex-1">
            <Text className="font-poppins-medium text-[16px] text-white/90">Continue learning</Text>
            <Text className="mt-1 font-poppins-semibold text-[27px] leading-[34px] text-white">{language.name}</Text>
            <Text className="mt-0.5 font-poppins-medium text-[16px] text-white/90">
              A1 · Unit {unit?.order ?? 1}
            </Text>
            <View className="mt-auto self-start rounded-control bg-white px-5 py-2.5">
              <Text className="font-poppins-semibold text-[16px] text-brand-purple">Continue</Text>
            </View>
          </View>
        </Pressable>

        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-poppins-semibold text-[18px] text-text-primary">Today’s plan</Text>
          <Pressable accessibilityRole="button" onPress={() => router.navigate("/(tabs)/learn")}>
            <Text className="font-poppins-semibold text-[16px] text-brand-purple">View all</Text>
          </Pressable>
        </View>

        <View className="mb-5">
          <PlanRow
            icon={{ ios: "book.closed.fill", android: "menu_book", web: "menu_book" }}
            iconBackgroundClass="bg-brand-purple"
            title="Lesson"
            description={currentLesson?.title ?? "Start your first lesson"}
            complete
          />
          <PlanRow
            icon={{ ios: "headphones", android: "headphones", web: "headphones" }}
            iconBackgroundClass="bg-brand-purple"
            title="AI Conversation"
            description={`Practice ${language.name.toLowerCase()} together`}
          />
          <PlanRow
            icon={{
              ios: "bubble.left.and.bubble.right.fill",
              android: "chat_bubble",
              web: "chat_bubble",
            }}
            iconBackgroundClass="bg-[#FF5B5F]"
            title="New words"
            description={`${currentLesson?.vocabulary.length ?? 0} words`}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.navigate("/(tabs)/ai-teacher")}
          className="mb-3 h-[108px] flex-row items-center overflow-hidden rounded-card bg-[#F2F8E9] pl-5 pr-3"
        >
          <View className="z-10 flex-1">
            <Text className="font-poppins text-[14px] text-text-secondary">Next up</Text>
            <Text className="mt-1 font-poppins-semibold text-[18px] text-text-primary">AI Video Call</Text>
            <Text className="mt-1 font-poppins text-[14px] text-text-primary">Practice speaking</Text>
          </View>
          <Image source={images.mascotTeacher} className="h-[104px] w-[100px]" resizeMode="contain" />
          <View className="ml-1 h-[48px] w-[48px] items-center justify-center rounded-full bg-[#28B900]">
            <SymbolView name={{ ios: "video.fill", android: "videocam", web: "videocam" }} size={22} tintColor="#FFFFFF" />
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

type PlanRowProps = {
  icon: SymbolViewProps["name"];
  iconBackgroundClass: string;
  title: string;
  description: string;
  complete?: boolean;
};

function PlanRow({ icon, iconBackgroundClass, title, description, complete = false }: PlanRowProps) {
  return (
    <View className="h-[72px] flex-row items-center">
      <View className={`h-[46px] w-[46px] items-center justify-center rounded-control ${iconBackgroundClass}`}>
        <SymbolView name={icon} size={23} tintColor="#FFFFFF" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="font-poppins-semibold text-[16px] text-text-primary">{title}</Text>
        <Text numberOfLines={1} className="mt-0.5 font-poppins text-[14px] text-text-secondary">{description}</Text>
      </View>
      {complete ? (
        <View className="h-7 w-7 items-center justify-center rounded-full bg-brand-purple">
          <SymbolView name={{ ios: "checkmark", android: "check", web: "check" }} size={16} weight="bold" tintColor="#FFFFFF" />
        </View>
      ) : (
        <View className="h-7 w-7 rounded-full border-2 border-[#9AA3B8]" />
      )}
    </View>
  );
}
