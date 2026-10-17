import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type BottomTabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>>[0];

const tabIcons: Record<string, SymbolViewProps["name"]> = {
  index: { ios: "house.fill", android: "home", web: "home" },
  learn: { ios: "book.closed", android: "menu_book", web: "menu_book" },
  "ai-teacher": { ios: "video", android: "smart_display", web: "smart_display" },
  chat: { ios: "bubble.left", android: "chat_bubble_outline", web: "chat_bubble_outline" },
  profile: { ios: "person.crop.circle", android: "person_outline", web: "person_outline" },
};

const activeTabSize = 48;
const horizontalInset = 8;

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [barWidth, setBarWidth] = useState(0);
  const indicatorX = useSharedValue(0);
  const activeRoute = state.routes[state.index];
  const slotWidth = barWidth / state.routes.length;

  useEffect(() => {
    if (slotWidth > 0) {
      indicatorX.value = withTiming(
        slotWidth * state.index + slotWidth / 2 - activeTabSize / 2,
        { duration: 220, easing: Easing.linear },
      );
    }
  }, [indicatorX, slotWidth, state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View className="border-t border-border bg-white">
      <View
        className="relative h-[68px] flex-row px-2"
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width - horizontalInset * 2)}
      >
        <Animated.View
          pointerEvents="none"
          className="absolute top-[6px] h-12 w-12 items-center justify-center rounded-full bg-brand-purple"
          style={[indicatorStyle, { left: horizontalInset }]}
        >
          <SymbolView
            name={tabIcons[activeRoute.name]}
            size={24}
            weight="semibold"
            tintColor="#FFFFFF"
          />
        </Animated.View>

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;
          const iconName = tabIcons[route.name];

          function onPress() {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              className="flex-1 items-center justify-center"
            >
              {!isFocused ? (
                <>
                  <SymbolView
                    name={iconName}
                    size={24}
                    weight="regular"
                    tintColor="#667085"
                  />
                  <Text className="mt-1 font-poppins-medium text-[12px] text-text-secondary">
                    {label}
                  </Text>
                </>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
