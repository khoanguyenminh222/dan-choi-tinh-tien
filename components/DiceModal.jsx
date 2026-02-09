import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import RedDie from "./RedDie";

const DiceModal = ({
  visible,
  onClose,
  diceValues,
  isRolling,
  rollDice,
  RedDie: RedDieProp,
}) => {
  if (!visible) return null;

  // Use passed RedDie or default to imported one (though App.js passes none currently, so we use imported)
  // Actually, to avoid circular deps or complex passing, we just import RedDie here directly.

  return (
    <View className="absolute inset-0 bg-black/70 items-center justify-center z-50">
      <View className="bg-white/90 p-8 rounded-[40px] items-center shadow-2xl w-[90%] border border-white/20">
        <Text className="text-gray-500 font-bold mb-8 uppercase tracking-widest text-xs">
          Dân chơi lắc xí ngầu
        </Text>
        <View className="flex-row gap-8 mb-8">
          <RedDie value={diceValues[0]} />
          <RedDie value={diceValues[1]} />
        </View>
        <View className="items-center">
          <Text className="text-gray-400 text-sm font-bold uppercase tracking-widest">
            Quá đã dân chơi ơi!
          </Text>
          <Text
            className="text-[#8B0000] text-6xl font-black mt-2"
            style={{ transform: [{ scale: !isRolling ? 1.1 : 1 }] }}
          >
            {!isRolling ? diceValues[0] + diceValues[1] : "..."}
          </Text>
        </View>
        {!isRolling && (
          <View className="mt-10 flex-row gap-4 w-full">
            <TouchableOpacity
              onPress={rollDice}
              className="flex-1 overflow-hidden rounded-2xl shadow-lg active:scale-95"
            >
              <LinearGradient
                colors={["#FFD700", "#FFA500"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="py-4 items-center justify-center border-t border-white/40"
              >
                <Text className="text-[#8B0000] font-black text-lg uppercase shadow-sm">
                  Lắc lại
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="flex-1 overflow-hidden rounded-2xl shadow-lg active:scale-95"
            >
              <LinearGradient
                colors={["#E52B50", "#C41E3A"]}
                className="py-4 items-center justify-center"
              >
                <Text className="text-white font-black text-lg uppercase">
                  Đóng
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default DiceModal;
