import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const GoldCoin = React.memo(({ size = 20, style }) => (
  <View style={style} pointerEvents="none">
    <LinearGradient
      colors={["#FFD700", "#FDB931", "#B8860B"]}
      className="items-center justify-center rounded-full shadow-md"
      style={{
        width: size,
        height: size,
        borderWidth: 1,
        borderColor: "#DAA520",
      }}
    >
      <View
        className="w-[40%] h-[40%] bg-[#8B0000]/20 rounded-sm"
        style={{ borderWidth: 1, borderColor: "#DAA520" }}
      />
    </LinearGradient>
  </View>
));

export default GoldCoin;
