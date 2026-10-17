import { Text, View } from "react-native";

type TabPlaceholderProps = {
  title: string;
};

export function TabPlaceholder({ title }: TabPlaceholderProps) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="font-poppins-bold text-h2 text-text-primary">{title}</Text>
      <Text className="mt-2 text-center font-poppins text-body-medium text-text-secondary">
        This tab is ready for its next lesson.
      </Text>
    </View>
  );
}
