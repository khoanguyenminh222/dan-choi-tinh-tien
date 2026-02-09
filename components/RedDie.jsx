import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const RedDie = ({ value }) => {
  const renderPips = () => {
    const pipPositions = {
      1: [4],
      2: [2, 6],
      3: [2, 4, 6],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    };

    const pips = pipPositions[value] || [];
    return (
      <View className="flex-row flex-wrap w-14 h-14 p-1 justify-center items-center">
        {[...Array(9)].map((_, i) => (
          <View key={i} className="w-1/3 h-1/3 items-center justify-center">
            {pips.includes(i) && (
              <View className="w-3.5 h-3.5 rounded-full bg-white shadow-inner overflow-hidden border border-[#FFD700]/30 font-bold">
                <LinearGradient
                  colors={["#FFD700", "#FDB931", "#B8860B"]}
                  className="absolute inset-0"
                />
                <View className="absolute top-0 left-0 w-1 h-1 bg-white/40 rounded-full ml-0.5 mt-0.5" />
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View
      style={{
        width: 96,
        height: 96,
        borderRadius: 36,
        backgroundColor: "#D41F3D", // Vital for shadow to follow curve
        transform: [{ rotate: "4deg" }],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 15,
        overflow: "visible", // Contain shadow correctly
      }}
      className="items-center justify-center"
    >
      {/* Clip inner layers */}
      <View className="absolute inset-0 rounded-[36px] overflow-hidden">
        {/* Main Body Gradient */}
        <LinearGradient
          colors={["#FF3E5E", "#D41F3D", "#8B0000"]}
          className="absolute inset-0"
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 0.8, y: 0.8 }}
        />

        {/* Highlight Curve */}
        <View className="absolute top-[3px] left-[3px] right-[5px] bottom-[7px] rounded-[32px] border-t-2 border-l border-white/30" />

        {/* Bottom Shadow depth */}
        <View className="absolute bottom-[3px] right-[3px] left-[7px] top-[7px] rounded-[32px] border-b-4 border-r-2 border-black/30" />

        {/* Reflection Gloss */}
        <LinearGradient
          colors={["rgba(255,255,255,0.2)", "transparent"]}
          className="absolute top-0 left-0 right-0 h-1/2"
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>

      {/* Actual Pips (outside clip for better rendering) */}
      <View style={{ transform: [{ scale: 1.2 }] }}>
        {value ? (
          renderPips()
        ) : (
          <Text className="text-white/20 text-5xl font-black italic">?</Text>
        )}
      </View>
    </View>
  );
};

export default RedDie;
