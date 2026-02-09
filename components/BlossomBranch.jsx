import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const BlossomBranch = React.memo(({ type, style }) => {
  const isPeach = type === "peach";
  const petalColor1 = isPeach ? "#FFC0CB" : "#FFFACD";
  const petalColor2 = isPeach ? "#FF69B4" : "#FFD700";

  return (
    <View style={style} pointerEvents="none" className="opacity-40">
      <View
        className="bg-[#f8e9e5] w-[2px] h-32 absolute rounded-full shadow-sm"
        style={{ transform: [{ rotate: "45deg" }] }}
      >
        {[...Array(6)].map((_, i) => (
          <View
            key={i}
            className="absolute shadow-sm"
            style={{
              top: i * 20,
              left: i % 2 === 0 ? 4 : -14,
              transform: [{ rotate: `${i * 30}deg` }],
            }}
          >
            <LinearGradient
              colors={[petalColor1, petalColor2]}
              className="w-5 h-5 rounded-full items-center justify-center"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View className="w-1 h-1 bg-white/40 rounded-full" />
            </LinearGradient>
          </View>
        ))}
      </View>
    </View>
  );
});

export default BlossomBranch;
