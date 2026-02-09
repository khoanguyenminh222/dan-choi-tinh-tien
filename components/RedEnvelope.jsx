import React from "react";
import { View, Text } from "react-native";

const RedEnvelope = React.memo(({ size = 30, style }) => (
  <View style={style} pointerEvents="none">
    <View
      className="bg-[#C41E3A] rounded-lg shadow-md items-center justify-center p-1"
      style={{
        width: size,
        height: size * 1.5,
        borderWidth: 1,
        borderColor: "#FFD700",
      }}
    >
      <View className="w-full h-full border border-[#FFD700]/50 items-center justify-center rounded-sm">
        <Text className="text-[#FFD700] text-[8px] font-black">🧧</Text>
      </View>
    </View>
  </View>
));

export default RedEnvelope;
