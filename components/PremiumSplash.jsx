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
    // Hide native splash once the JS component is mounted
    // We do it here to ensure it always happens, even if the image fails to load
    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.log("SplashScreen hide error", e);
      }
    };

    // Give it a tiny bit of time to render the first frame
    setTimeout(hideSplash, 100);

    // Start animation sequence
    opacity.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });

    scale.value = withTiming(1, {
      duration: 2500,
      easing: Easing.out(Easing.quad),
    });

    // Safety timeout: If after 3 seconds we haven't finished, force finish
    const safetyTimer = setTimeout(() => {
      if (onFinish) {
        console.log("PremiumSplash safety timer fired");
        onFinish();
      }
    }, 3000);

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
      return () => {
        clearTimeout(timer);
        clearTimeout(safetyTimer);
      };
    }

    return () => clearTimeout(safetyTimer);
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
      style={[
        styles.container,
        animatedContainerStyle,
        { flex: 1, backgroundColor: "#000" },
      ]}
    >
      <Animated.Image
        source={require("../assets/splash-icon.png")}
        style={[styles.image, animatedImageStyle]}
        resizeMode="cover"
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
    backgroundColor: "#000",
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
