import React, { useEffect } from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";

const { width, height } = Dimensions.get("window");

const PremiumSplash = ({ onFinish, isDataLoaded }) => {
  const scale = useSharedValue(1.1);
  const opacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(1);

  useEffect(() => {
    // Start animation sequence
    opacity.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });

    scale.value = withTiming(1, {
      duration: 2500,
      easing: Easing.out(Easing.quad),
    });

    // Wait for minimum time AND data to be loaded before exiting
    if (isDataLoaded) {
      const timer = setTimeout(() => {
        backgroundOpacity.value = withTiming(
          0,
          {
            duration: 800,
          },
          (finished) => {
            if (finished && onFinish) {
              runOnJS(onFinish)();
            }
          },
        );
      }, 2000); // Keep for at least 2 seconds for branding
      return () => clearTimeout(timer);
    }
  }, [isDataLoaded]);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  return (
    <Animated.View
      style={[styles.container, animatedContainerStyle]}
      className="bg-black"
    >
      <Animated.Image
        source={require("../assets/splash-icon.png")}
        style={[styles.image, animatedImageStyle]}
        resizeMode="cover"
        onLoad={async () => {
          // Hide native splash once the JS image is actually rendered
          try {
            await SplashScreen.hideAsync();
          } catch (e) {
            console.log("SplashScreen hide error", e);
          }
        }}
      />

      {/* Subtle overlay for depth */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.overlay} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  image: {
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
});

export default PremiumSplash;
