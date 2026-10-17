import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { images } from "../../constants/images";
import { languages } from "../../data/languages";
import { useLanguageStore } from "../store/language-store";

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const selectedLanguageId = useLanguageStore((state) => state.selectedLanguageId);
  const setSelectedLanguage = useLanguageStore((state) => state.setSelectedLanguage);
  const [pendingLanguageId, setPendingLanguageId] = useState(
    selectedLanguageId ?? "spanish",
  );
  const filteredLanguages = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) return languages;

    return languages.filter((language) =>
      `${language.name} ${language.nativeName}`.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [query]);
  const selectedLanguage = languages.find(
    (language) => language.id === pendingLanguageId,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative h-12 flex-row items-center justify-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            className="absolute left-0 h-12 w-12 items-center justify-center"
          >
            <Text className="font-poppins text-[34px] leading-[38px] text-text-primary">‹</Text>
          </Pressable>
          <Text className="font-poppins-semibold text-[20px] text-text-primary">
            Choose a language
          </Text>
        </View>

        <View className="mt-4 h-[52px] flex-row items-center rounded-pill border border-border bg-[#FAFAFC] px-5">
          <Text className="mr-3 font-poppins text-[25px] text-text-secondary">⌕</Text>
          <TextInput
            accessibilityLabel="Search languages"
            className="h-full flex-1 font-poppins text-[17px] text-text-primary"
            onChangeText={setQuery}
            placeholder="Search languages"
            placeholderTextColor="#8A91A5"
            returnKeyType="search"
            value={query}
          />
        </View>

        <Text className="mt-6 font-poppins-semibold text-[16px] text-text-primary">
          Popular
        </Text>

        <View className="mt-3 gap-1.5">
          {filteredLanguages.map((language) => {
            const isSelected = language.id === pendingLanguageId;

            return (
              <Pressable
                key={language.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                onPress={() => setPendingLanguageId(language.id)}
                className={`h-[82px] flex-row items-center rounded-card border px-4 ${
                  isSelected
                    ? "border-2 border-brand-purple bg-[#F9F7FF]"
                    : "border-border bg-white"
                }`}
              >
                <View className="h-[42px] w-[42px] items-center justify-center rounded-full border border-border bg-white">
                  <Text className="text-[27px]">{language.flag}</Text>
                </View>
                <View className="ml-4 flex-1">
                  <Text className="font-poppins-medium text-[17px] text-text-primary">
                    {language.name}
                  </Text>
                  <Text className="mt-1 font-poppins text-[14px] text-text-secondary">
                    {language.learnerCount} learners
                  </Text>
                </View>
                {isSelected ? (
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-purple">
                    <Text className="font-poppins-bold text-[19px] text-white">✓</Text>
                  </View>
                ) : (
                  <Text className="font-poppins text-[30px] text-text-secondary">›</Text>
                )}
              </Pressable>
            );
          })}
          {filteredLanguages.length === 0 ? (
            <Text className="py-8 text-center font-poppins text-body-medium text-text-secondary">
              No languages found. Try another search.
            </Text>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setSelectedLanguage(pendingLanguageId);
            router.replace("/");
          }}
          className="mt-4 h-[56px] items-center justify-center rounded-control bg-brand-purple"
        >
          <Text className="font-poppins-semibold text-[17px] text-white">
            Continue with {selectedLanguage?.name ?? "your language"}
          </Text>
        </Pressable>

        <Image
          accessibilityLabel="A colorful earth surrounded by world landmarks"
          source={images.earth}
          className="mt-3 h-[180px] w-full"
          resizeMode="contain"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
});
