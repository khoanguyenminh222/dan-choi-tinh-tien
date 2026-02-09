import React from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  Plus,
  EyeOff,
  Flag,
  CheckCheck,
  Sigma,
  Heart,
} from "lucide-react-native";

const TableBodyComponent = React.memo(
  ({
    currentSession,
    totals,
    isHidden,
    setIsHidden,
    indexColWidth,
    colWidth,
    tableScrollRef,
    editPlayerName,
    removePlayer,
    deleteRound,
    updateRoundValue,
    addRound,
    finalizeRounds,
    setShowEnd,
    isKeyboardVisible,
    inputRefs,
    handleInputSubmit,
    isUyenMode,
    setIsUyenMode,
  }) => {
    return (
      <>
        <View className="bg-[#FFF8E1] border-b-2 border-[#FFD700] shadow-sm z-10 py-1.5 px-2 mt-2">
          <View className="flex-row items-center">
            <View
              style={{ width: indexColWidth }}
              className="mr-1 items-center justify-center"
            >
              <Sigma size={14} color="#8B0000" />
            </View>
            {currentSession.players.map((name, idx) => {
              const maxTotal = Math.max(...totals);
              const isWinner = totals[idx] === maxTotal && maxTotal > 0;

              return (
                <View
                  key={idx}
                  style={{ width: colWidth, minHeight: 52 }}
                  className="mr-1 items-center justify-end"
                >
                  <View
                    style={{
                      minHeight: 18,
                      justifyContent: "flex-end",
                      alignItems: "center",
                      marginBottom: 2,
                    }}
                  >
                    {isWinner && (
                      <Text style={{ fontSize: 16, lineHeight: 18 }}>👑</Text>
                    )}
                    {currentSession.dealerIndex === idx && (
                      <Text
                        className="text-[#D41F3D] text-[7px] font-black uppercase"
                        style={{ letterSpacing: 0.5, lineHeight: 8 }}
                      >
                        NHÀ CÁI
                      </Text>
                    )}
                    {!isWinner && currentSession.dealerIndex !== idx && (
                      <Text
                        className="text-gray-300 text-[9px] font-black uppercase"
                        style={{ letterSpacing: 0.5 }}
                      >
                        DÂN CHƠI
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => editPlayerName(idx)}
                    onLongPress={() => editPlayerName(idx)}
                    className="w-full items-center mb-1"
                  >
                    <Text
                      className="text-[#8B0000] text-[10px] font-black uppercase tracking-tighter"
                      numberOfLines={1}
                    >
                      {name}
                    </Text>
                  </TouchableOpacity>
                  <Text
                    className={`text-base font-black ${totals[idx] >= 0 ? "text-blue-800" : "text-red-700"}`}
                  >
                    {isHidden
                      ? "***"
                      : totals[idx] > 0
                        ? `+${totals[idx]}`
                        : totals[idx]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <ScrollView
          ref={tableScrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled={true}
        >
          {currentSession.rounds.map((round, rIdx) => (
            <View
              key={rIdx}
              className={`flex-row items-center py-2.5 px-2 border-b border-white/5 ${rIdx % 2 === 0 ? "bg-white/5" : ""}`}
            >
              <TouchableOpacity
                onLongPress={() => deleteRound(rIdx)}
                activeOpacity={0.6}
                style={{ width: indexColWidth }}
                className="h-7 items-center justify-center rounded-md mr-1 bg-[#FFD700]/30"
              >
                <Text className="text-[#8B0000] text-xs font-black">
                  {rIdx + 1}
                </Text>
              </TouchableOpacity>

              {round.map((val, pIdx) => {
                const numVal = parseFloat(val || 0);
                const isDealer = currentSession.dealerIndex === pIdx;
                let textColor = "text-[#8B0000]"; // Mặc định

                if (numVal > 0) {
                  textColor = "text-blue-600"; // Số dương: xanh
                } else if (numVal < 0) {
                  textColor = "text-red-600"; // Số âm: đỏ
                } else if (isDealer) {
                  textColor = "text-[#D41F3D]"; // Nhà cái (0): đỏ đậm
                }

                return (
                  <View
                    key={pIdx}
                    style={{ width: colWidth }}
                    className="mr-1 h-14"
                  >
                    <TextInput
                      ref={(el) => (inputRefs.current[`${rIdx}-${pIdx}`] = el)}
                      keyboardType="numeric"
                      className={`text-center font-bold text-base w-full h-full ${textColor}`}
                      value={isHidden ? "***" : val === "0" ? "" : val}
                      onChangeText={(text) =>
                        !isHidden && updateRoundValue(rIdx, pIdx, text)
                      }
                      onSubmitEditing={() => handleInputSubmit(rIdx, pIdx)}
                      returnKeyType={
                        pIdx === currentSession.players.length - 1
                          ? "done"
                          : "next"
                      }
                      blurOnSubmit={pIdx === currentSession.players.length - 1}
                      placeholder="0"
                      placeholderTextColor="rgba(17, 17, 17, 0.4)"
                      selectTextOnFocus
                      editable={
                        !isHidden &&
                        currentSession.dealerIndex !== pIdx &&
                        rIdx === currentSession.rounds.length - 1
                      } // Chỉ sửa dòng cuối
                      pointerEvents={
                        currentSession.dealerIndex === pIdx ||
                        rIdx !== currentSession.rounds.length - 1
                          ? "none"
                          : "auto"
                      }
                    />
                    {currentSession.dealerIndex !== pIdx &&
                      rIdx === currentSession.rounds.length - 1 && (
                        <TouchableOpacity
                          className="absolute inset-0"
                          activeOpacity={1}
                          onPress={() =>
                            inputRefs.current[`${rIdx}-${pIdx}`]?.focus()
                          }
                        />
                      )}
                  </View>
                );
              })}
              <View className="w-8" />
            </View>
          ))}

          <View className="flex-row px-2 py-4">
            <View
              style={{ width: indexColWidth }}
              className="items-center justify-center mr-1"
            >
              <TouchableOpacity
                onPress={addRound}
                className="bg-[#FFD700] w-9 h-9 rounded-full items-center justify-center shadow-md active:scale-90"
                style={{
                  shadowColor: "#FFD700",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.5,
                  shadowRadius: 4,
                }}
              >
                <Plus size={22} color="#8B0000" />
              </TouchableOpacity>
            </View>
          </View>

          {!isKeyboardVisible && (
            <View className="items-center mt-16 mb-40 opacity-40">
              <Text className="text-[#8B0000] text-[12px] font-black uppercase tracking-[3px]">
                Dân Chơi Tính Tiền
              </Text>
              <Text className="text-[#8B0000] text-[10px] font-bold uppercase tracking-[2px] mt-0.5 opacity-60">
                Created by
              </Text>
              <Text
                className="text-[#8B0000] text-lg font-black italic mt-1"
                style={{ letterSpacing: 1 }}
              >
                Khoa Ryo
              </Text>
              <View className="w-12 h-[1px] bg-[#FFD700] mt-2" />
            </View>
          )}
          <View className="h-16" />
        </ScrollView>

        {!isKeyboardVisible && (
          <View className="absolute bottom-6 left-5 right-5 h-16 rounded-3xl shadow-xl flex-row overflow-hidden border border-gray-100 bg-white/95">
            <TouchableOpacity
              onPress={() => setIsHidden(!isHidden)}
              className="flex-1 items-center justify-center border-r border-gray-100"
            >
              <EyeOff size={22} color={isHidden ? "#ccc" : "#D41F3D"} />
              <Text
                className={`${isHidden ? "text-gray-400" : "text-[#D41F3D]"} text-[10px] font-black mt-1 uppercase`}
              >
                Ẩn
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={addRound}
              className="flex-1 items-center justify-center border-r border-gray-100"
            >
              <Plus size={24} color="#D41F3D" />
              <Text className="text-[#D41F3D] text-[10px] font-black mt-1 uppercase">
                Thêm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={finalizeRounds}
              className="flex-1 items-center justify-center border-r border-gray-100"
            >
              <CheckCheck size={22} color="#D41F3D" />
              <Text className="text-[#D41F3D] text-[10px] font-black mt-1 uppercase">
                Chốt số
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowEnd(true)}
              className="flex-1 items-center justify-center"
            >
              <Flag size={22} color="#D41F3D" />
              <Text className="text-[#D41F3D] text-[10px] font-black mt-1 uppercase">
                Kết thúc
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  },
);

export default TableBodyComponent;
