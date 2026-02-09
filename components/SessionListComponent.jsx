import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Settings } from "lucide-react-native";
import GoldCoin from "./GoldCoin";
import { calculateSessionTotals } from "../utils/gameLogic";

const SessionListComponent = React.memo(
  ({
    sessions,
    setCurrentSessionId,
    editSessionName,
    deleteSession,
    createSession,
    GoldCoin: PropGoldCoin,
  }) => {
    // Use passed GoldCoin or imported one.
    const CoinComponent = PropGoldCoin || GoldCoin;

    return (
      <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
        <View className="px-6 pt-8 pb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-[#8B0000] text-3xl font-black tracking-tight">
              Cái tết ấm no
            </Text>
            <Text className="text-[#8B0000]/50 text-sm font-medium mt-1">
              Chọn hoặc tạo bàn chơi mới
            </Text>
          </View>
          <TouchableOpacity
            onPress={createSession}
            className="bg-[#D41F3D] p-3.5 rounded-2xl shadow-lg active:scale-95"
            style={{
              shadowColor: "#D41F3D",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <Plus size={28} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-4 mt-2"
          showsVerticalScrollIndicator={false}
        >
          {sessions.length === 0 ? (
            <View className="items-center justify-center mt-20 opacity-30">
              <View className="bg-gray-100 p-8 rounded-full mb-4">
                <Settings size={60} color="#8B0000" />
              </View>
              <Text className="text-[#8B0000] text-lg font-bold">
                Chưa có bàn nào
              </Text>
              <Text className="text-[#8B0000]/60 text-sm">
                Nhấn dấu + để bắt đầu
              </Text>
            </View>
          ) : (
            sessions.map((session) => {
              const totals = calculateSessionTotals(session);
              const winnerIdx = totals.indexOf(Math.max(...totals));

              return (
                <TouchableOpacity
                  key={session.id}
                  onPress={() => setCurrentSessionId(session.id)}
                  onLongPress={() => {
                    Alert.alert("Tùy chọn", "Bạn muốn làm gì với bàn này?", [
                      { text: "Hủy", style: "cancel" },
                      {
                        text: "Đổi tên",
                        onPress: () => editSessionName(session),
                      },
                      {
                        text: "Xóa",
                        style: "destructive",
                        onPress: () => deleteSession(session.id),
                      },
                    ]);
                  }}
                  className="bg-white p-5 rounded-[32px] mb-4 border border-gray-100 flex-row items-center justify-between shadow-sm"
                >
                  <View className="flex-1">
                    <Text className="text-[#8B0000] text-xl font-bold">
                      {session.name}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      {new Date(session.createdAt).toLocaleDateString("vi-VN")}{" "}
                      • {session.players.length} người chơi
                    </Text>

                    <View className="flex-row mt-3 items-center">
                      {session.players.slice(0, 3).map((p, i) => (
                        <View
                          key={i}
                          className="bg-gray-100 px-2.5 py-1 rounded-full mr-1.5"
                        >
                          <Text className="text-gray-600 text-[10px] font-bold">
                            {p}
                          </Text>
                        </View>
                      ))}
                      {session.players.length > 3 && (
                        <Text className="text-gray-300 text-[10px] ml-1">
                          +{session.players.length - 3}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <View className="items-end mr-3">
                      <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest leading-none mb-0.5">
                        Rich Kid
                      </Text>
                      <Text
                        className="text-blue-600 text-[11px] font-black uppercase tracking-tight"
                        numberOfLines={1}
                      >
                        {session.players[winnerIdx]}
                      </Text>
                    </View>
                    {totals[winnerIdx] > 0 && (
                      <View className="bg-[#FFD700]/30 px-2 py-1.5 rounded-xl border border-[#FFD700]/50 shadow-sm">
                        <Text className="text-[#8B0000] text-[10px] font-black">
                          👑 {totals[winnerIdx]}
                        </Text>
                      </View>
                    )}
                  </View>
                  {CoinComponent && (
                    <CoinComponent
                      size={15}
                      style={{
                        position: "absolute",
                        top: -5,
                        right: 10,
                        opacity: 0.6,
                      }}
                    />
                  )}
                </TouchableOpacity>
              );
            })
          )}

          {/* Creator Signature */}
          <View className="items-center mt-16 mb-8 opacity-30">
            <Text className="text-[#8B0000] text-[12px] font-black uppercase tracking-[4px]">
              Dân Chơi Tính Tiền
            </Text>
            <Text className="text-[#8B0000] text-[10px] font-bold uppercase tracking-[2px] mt-1 opacity-60">
              Created by
            </Text>
            <Text
              className="text-[#8B0000] text-2xl font-black italic mt-1"
              style={{ letterSpacing: 1 }}
            >
              Khoa Ryo
            </Text>
            <View className="w-16 h-[2px] bg-[#FFD700] mt-3 rounded-full" />
          </View>

          <View className="h-24" />
        </ScrollView>
      </SafeAreaView>
    );
  },
);

export default SessionListComponent;
