import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, useWindowDimensions, Share, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, EyeOff, Flag, Settings, ChartBar, Dices, ChevronLeft, UserPlus, CheckCheck, Sigma, Share2 } from 'lucide-react-native';
import "./global.css";

const STORAGE_KEY = '@gamble_tracker_data';

// Helper component for a single die matching the red/gold theme
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
                  colors={['#FFD700', '#FDB931', '#B8860B']}
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
        backgroundColor: '#D41F3D', // Vital for shadow to follow curve
        transform: [{ rotate: '4deg' }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 15,
        overflow: 'visible', // Contain shadow correctly
      }}
      className="items-center justify-center"
    >
      {/* Clip inner layers */}
      <View className="absolute inset-0 rounded-[36px] overflow-hidden">
        {/* Main Body Gradient */}
        <LinearGradient
          colors={['#FF3E5E', '#D41F3D', '#8B0000']}
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
          colors={['rgba(255,255,255,0.2)', 'transparent']}
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

// Decorative Gold Coin component
const GoldCoin = React.memo(({ size = 20, style }) => (
  <View style={style} pointerEvents="none">
    <LinearGradient
      colors={['#FFD700', '#FDB931', '#B8860B']}
      className="items-center justify-center rounded-full shadow-md"
      style={{ width: size, height: size, borderWidth: 1, borderColor: '#DAA520' }}
    >
      <View className="w-[40%] h-[40%] bg-[#8B0000]/20 rounded-sm" style={{ borderWidth: 1, borderColor: '#DAA520' }} />
    </LinearGradient>
  </View>
));

const RedEnvelope = React.memo(({ size = 30, style }) => (
  <View style={style} pointerEvents="none">
    <View
      className="bg-[#C41E3A] rounded-lg shadow-md items-center justify-center p-1"
      style={{ width: size, height: size * 1.5, borderWidth: 1, borderColor: '#FFD700' }}
    >
      <View className="w-full h-full border border-[#FFD700]/50 items-center justify-center rounded-sm">
        <Text className="text-[#FFD700] text-[8px] font-black">🧧</Text>
      </View>
    </View>
  </View>
));

const SessionListComponent = React.memo(({ sessions, setCurrentSessionId, editSessionName, deleteSession, createSession, GoldCoin }) => {
  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
      <View className="px-6 pt-8 pb-4 flex-row justify-between items-center">
        <View>
          <Text className="text-[#8B0000] text-3xl font-black tracking-tight">Cái tết ấm no</Text>
          <Text className="text-[#8B0000]/50 text-sm font-medium mt-1">Chọn hoặc tạo bàn chơi mới</Text>
        </View>
        <TouchableOpacity
          onPress={createSession}
          className="bg-[#D41F3D] p-3.5 rounded-2xl shadow-lg active:scale-95"
          style={{ shadowColor: '#D41F3D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
        >
          <Plus size={28} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 mt-2" showsVerticalScrollIndicator={false}>
        {sessions.length === 0 ? (
          <View className="items-center justify-center mt-20 opacity-30">
            <View className="bg-gray-100 p-8 rounded-full mb-4">
              <Settings size={60} color="#8B0000" />
            </View>
            <Text className="text-[#8B0000] text-lg font-bold">Chưa có bàn nào</Text>
            <Text className="text-[#8B0000]/60 text-sm">Nhấn dấu + để bắt đầu</Text>
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
                  Alert.alert('Tùy chọn', 'Bạn muốn làm gì với bàn này?', [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Đổi tên', onPress: () => editSessionName(session) },
                    { text: 'Xóa', style: 'destructive', onPress: () => deleteSession(session.id) }
                  ]);
                }}
                className="bg-white p-5 rounded-[32px] mb-4 border border-gray-100 flex-row items-center justify-between shadow-sm"
              >
                <View className="flex-1">
                  <Text className="text-[#8B0000] text-xl font-bold">{session.name}</Text>
                  <Text className="text-gray-400 text-xs mt-1">
                    {new Date(session.createdAt).toLocaleDateString('vi-VN')} • {session.players.length} người chơi
                  </Text>

                  <View className="flex-row mt-3 items-center">
                    {session.players.slice(0, 3).map((p, i) => (
                      <View key={i} className="bg-gray-100 px-2.5 py-1 rounded-full mr-1.5">
                        <Text className="text-gray-600 text-[10px] font-bold">{p}</Text>
                      </View>
                    ))}
                    {session.players.length > 3 && (
                      <Text className="text-gray-300 text-[10px] ml-1">+{session.players.length - 3}</Text>
                    )}
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View className="items-end mr-3">
                    <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest leading-none mb-0.5">Rich Kid</Text>
                    <Text className="text-blue-600 text-[11px] font-black uppercase tracking-tight" numberOfLines={1}>
                      {session.players[winnerIdx]}
                    </Text>
                  </View>
                  {totals[winnerIdx] > 0 && (
                    <View className="bg-[#FFD700]/30 px-2 py-1.5 rounded-xl border border-[#FFD700]/50 shadow-sm">
                      <Text className="text-[#8B0000] text-[10px] font-black">🔥 {totals[winnerIdx]}</Text>
                    </View>
                  )}
                </View>
                {GoldCoin && <GoldCoin size={15} style={{ position: 'absolute', top: -5, right: 10, opacity: 0.6 }} />}
              </TouchableOpacity>
            );
          })
        )}

        {/* Creator Signature */}
        <View className="items-center mt-16 mb-8 opacity-30">
          <Text className="text-[#8B0000] text-[12px] font-black uppercase tracking-[4px]">Dân Chơi Tính Tiền</Text>
          <Text className="text-[#8B0000] text-[10px] font-bold uppercase tracking-[2px] mt-1 opacity-60">Created by</Text>
          <Text className="text-[#8B0000] text-2xl font-black italic mt-1" style={{ letterSpacing: 1 }}>Khoa Ryo</Text>
          <View className="w-16 h-[2px] bg-[#FFD700] mt-3 rounded-full" />
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
});

const TableBodyComponent = React.memo(({
  currentSession, totals, isHidden, indexColWidth, colWidth, tableScrollRef,
  editPlayerName, removePlayer, deleteRound, updateRoundValue, addRound, finalizeRounds, setShowEnd, isKeyboardVisible, inputRefs, handleInputSubmit
}) => {
  return (
    <>
      <View className="bg-[#FFF8E1] border-b-2 border-[#FFD700] shadow-sm z-10 py-1.5 px-2 mt-2">
        <View className="flex-row items-center">
          <View style={{ width: indexColWidth }} className="mr-1 items-center justify-center">
            <Sigma size={14} color="#8B0000" />
          </View>
          {currentSession.players.map((name, idx) => (
            <View key={idx} style={{ width: colWidth }} className="mr-1 items-center">
              <TouchableOpacity
                onPress={() => editPlayerName(idx)}
                onLongPress={() => removePlayer(idx)}
                className="w-full items-center mb-1"
              >
                <Text className="text-[#8B0000] text-[10px] font-black uppercase tracking-tighter" numberOfLines={1}>{name}</Text>
              </TouchableOpacity>
              <Text className={`text-base font-black ${totals[idx] >= 0 ? 'text-blue-800' : 'text-red-700'}`}>
                {isHidden ? '***' : (totals[idx] > 0 ? `+${totals[idx]}` : totals[idx])}
              </Text>
            </View>
          ))}
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
            className={`flex-row items-center py-2.5 px-2 border-b border-white/5 ${rIdx % 2 === 0 ? 'bg-white/5' : ''}`}
          >
            <TouchableOpacity
              onLongPress={() => deleteRound(rIdx)}
              activeOpacity={0.6}
              style={{ width: indexColWidth }}
              className="h-7 items-center justify-center rounded-md mr-1 bg-[#FFD700]/30"
            >
              <Text className="text-[#8B0000] text-xs font-black">{rIdx + 1}</Text>
            </TouchableOpacity>

            {round.map((val, pIdx) => (
              <View key={pIdx} style={{ width: colWidth }} className="mr-1 h-14">
                <TextInput
                  ref={el => inputRefs.current[`${rIdx}-${pIdx}`] = el}
                  keyboardType="numeric"
                  className="text-center text-[#8B0000] font-bold text-base w-full h-full"
                  value={isHidden ? '***' : (val === '0' ? '' : val)}
                  onChangeText={(text) => !isHidden && updateRoundValue(rIdx, pIdx, text)}
                  onSubmitEditing={() => handleInputSubmit(rIdx, pIdx)}
                  returnKeyType={pIdx === currentSession.players.length - 1 ? 'done' : 'next'}
                  blurOnSubmit={pIdx === currentSession.players.length - 1}
                  placeholder="0"
                  placeholderTextColor="rgba(17, 17, 17, 0.4)"
                  selectTextOnFocus
                  editable={!isHidden}
                  pointerEvents="none"
                />
                <TouchableOpacity
                  className="absolute inset-0"
                  activeOpacity={1}
                  onPress={() => inputRefs.current[`${rIdx}-${pIdx}`]?.focus()}
                />
              </View>
            ))}
            <View className="w-8" />
          </View>
        ))}

        <View className="flex-row px-2 py-4">
          <View style={{ width: indexColWidth }} className="items-center justify-center mr-1">
            <TouchableOpacity
              onPress={addRound}
              className="bg-[#FFD700] w-9 h-9 rounded-full items-center justify-center shadow-md active:scale-90"
              style={{ shadowColor: '#FFD700', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4 }}
            >
              <Plus size={22} color="#8B0000" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="items-center mt-16 mb-2 opacity-40">
          <Text className="text-[#8B0000] text-[12px] font-black uppercase tracking-[3px]">Dân Chơi Tính Tiền</Text>
          <Text className="text-[#8B0000] text-[10px] font-bold uppercase tracking-[2px] mt-0.5 opacity-60">Created by</Text>
          <Text className="text-[#8B0000] text-lg font-black italic mt-1" style={{ letterSpacing: 1 }}>Khoa Ryo</Text>
          <View className="w-12 h-[1px] bg-[#FFD700] mt-2" />
        </View>
        <View className="h-52" />
      </ScrollView>

      {!isKeyboardVisible && (
        <View className="absolute bottom-6 left-5 right-5 h-16 rounded-3xl shadow-xl flex-row overflow-hidden border border-gray-100 bg-white/95">
          <TouchableOpacity onPress={() => setIsHidden(!isHidden)} className="flex-1 items-center justify-center border-r border-gray-100">
            <EyeOff size={22} color={isHidden ? '#ccc' : '#D41F3D'} />
            <Text className={`${isHidden ? 'text-gray-400' : 'text-[#D41F3D]'} text-[10px] font-black mt-1 uppercase`}>Ẩn</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={addRound} className="flex-1 items-center justify-center border-r border-gray-100">
            <Plus size={24} color="#D41F3D" />
            <Text className="text-[#D41F3D] text-[10px] font-black mt-1 uppercase">Thêm</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={finalizeRounds} className="flex-1 items-center justify-center border-r border-gray-100">
            <CheckCheck size={22} color="#D41F3D" />
            <Text className="text-[#D41F3D] text-[10px] font-black mt-1 uppercase">Chốt số</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEnd(true)} className="flex-1 items-center justify-center">
            <Flag size={22} color="#D41F3D" />
            <Text className="text-[#D41F3D] text-[10px] font-black mt-1 uppercase">Kết thúc</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
});
const BlossomBranch = React.memo(({ type, style }) => {
  const isPeach = type === 'peach';
  const petalColor1 = isPeach ? '#FFC0CB' : '#FFFACD';
  const petalColor2 = isPeach ? '#FF69B4' : '#FFD700';

  return (
    <View style={style} pointerEvents="none" className="opacity-40">
      <View
        className="bg-[#f8e9e5] w-[2px] h-32 absolute rounded-full shadow-sm"
        style={{ transform: [{ rotate: '45deg' }] }}
      >
        {[...Array(6)].map((_, i) => (
          <View
            key={i}
            className="absolute shadow-sm"
            style={{
              top: i * 20,
              left: (i % 2 === 0 ? 4 : -14),
              transform: [{ rotate: `${i * 30}deg` }]
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
const CustomInputModal = React.memo(({ modal, setModal }) => {
  if (!modal.visible) return null;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="absolute inset-0 bg-black/50 items-center justify-center z-[60]">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="w-full items-center"
        >
          <View className="bg-white p-7 rounded-[40px] w-[88%] shadow-2xl items-center">
            <View className="bg-orange-50 p-4 rounded-full mb-4">
              {modal.icon ? React.cloneElement(modal.icon, { color: '#D41F3D', size: 32 }) : <Plus size={32} color="#D41F3D" />}
            </View>
            <Text className="text-xl font-black mb-2 text-[#8B0000] uppercase tracking-tight">{modal.title}</Text>
            <Text className="text-gray-400 text-center mb-6 font-medium px-2">{modal.description}</Text>

            <TextInput
              className="w-full bg-gray-50 p-4 rounded-2xl text-lg font-bold text-gray-800 mb-8 border border-gray-100"
              placeholder={modal.placeholder}
              value={modal.value}
              onChangeText={(text) => setModal({ ...modal, value: text })}
              autoFocus
              selectTextOnFocus={true}
              clearButtonMode="while-editing"
            />

            <View className="flex-row w-full gap-3">
              <TouchableOpacity
                onPress={() => setModal({ ...modal, visible: false })}
                className="flex-1 bg-gray-100 py-4 rounded-2xl items-center"
              >
                <Text className="text-gray-500 font-bold">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  modal.onConfirm(modal.value);
                  setModal({ ...modal, visible: false });
                }}
                className="flex-1 bg-[#D41F3D] py-4 rounded-2xl items-center shadow-lg active:scale-95"
              >
                <Text className="text-white font-black uppercase">Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
});

const StaticBackground = React.memo(() => (
  <>
    {/* Main Decorative Branches */}
    <BlossomBranch type="peach" style={{ position: 'absolute', top: -30, right: -40, zIndex: 0, transform: [{ scale: 1.5 }, { rotate: '-15deg' }] }} />
    <BlossomBranch type="apricot" style={{ position: 'absolute', top: '40%', left: -50, zIndex: 0, transform: [{ scale: 1.2 }, { rotate: '160deg' }] }} />

    {/* Central Background Branches (Low Opacity) */}
    <BlossomBranch type="peach" style={{ position: 'absolute', top: '25%', right: '15%', zIndex: 0, opacity: 0.15, transform: [{ scale: 1.8 }, { rotate: '10deg' }] }} />
    <BlossomBranch type="apricot" style={{ position: 'absolute', bottom: '30%', left: '10%', zIndex: 0, opacity: 0.15, transform: [{ scale: 1.6 }, { rotate: '-150deg' }] }} />

    <BlossomBranch type="peach" style={{ position: 'absolute', bottom: -20, right: -30, zIndex: 0, transform: [{ scale: 1.3 }, { rotate: '190deg' }] }} />

    {/* Floating Subtle Elements */}
    <GoldCoin size={35} style={{ position: 'absolute', top: 120, left: 30, opacity: 0.12, transform: [{ rotate: '15deg' }] }} />
    <GoldCoin size={25} style={{ position: 'absolute', bottom: 250, right: 40, opacity: 0.1, transform: [{ rotate: '-20deg' }] }} />
    <RedEnvelope size={40} style={{ position: 'absolute', top: '65%', left: 20, opacity: 0.08, transform: [{ rotate: '-10deg' }] }} />
    <RedEnvelope size={30} style={{ position: 'absolute', top: 200, right: 30, opacity: 0.06, transform: [{ rotate: '25deg' }] }} />
  </>
));

const calculateSessionTotals = (session) => {
  const totals = session.players.map((_, i) => (session.baseline ? parseFloat(session.baseline[i] || 0) : 0));
  session.rounds.forEach(round => {
    round.forEach((val, idx) => {
      if (idx < totals.length) {
        totals[idx] += parseFloat(val || 0);
      }
    });
  });
  return totals;
};

export default function App() {
  const { width: windowWidth } = useWindowDimensions();
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Functional States (for TableDetail)
  const [isHidden, setIsHidden] = useState(false);
  const [diceValues, setDiceValues] = useState([null, null]);
  const [isRolling, setIsRolling] = useState(false);
  const [showDice, setShowDice] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const inputRefs = React.useRef({});
  const tableScrollRef = React.useRef(null);
  const [inputModal, setInputModal] = useState({
    visible: false,
    title: '',
    description: '',
    placeholder: '',
    value: '',
    type: '', // 'session', 'player', 'rename-session', 'rename-player'
    onConfirm: (val) => { },
    icon: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
          const data = JSON.parse(jsonValue);
          if (Array.isArray(data)) {
            setSessions(data);
          } else if (data.players) {
            // Migration for old single session data
            const legacySession = {
              id: Date.now().toString(),
              name: 'Trận đấu cũ',
              players: data.players || ['Người 1', 'Người 2', 'Người 3', 'Người 4'],
              rounds: data.rounds || [],
              createdAt: new Date().toISOString()
            };
            setSessions([legacySession]);
            setCurrentSessionId(legacySession.id);
          }
        }
      } catch (e) {
        console.error('Failed to load data', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  useEffect(() => {
    if (!isLoaded) return;
    const saveData = async () => {
      try {
        const jsonValue = JSON.stringify(sessions);
        await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
      } catch (e) {
        console.error('Failed to save data', e);
      }
    };
    saveData();
  }, [sessions, isLoaded]);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Controlled Auto-scroll: Only when round count changes
  useEffect(() => {
    if (currentSessionId && currentSession?.rounds?.length > 0) {
      const timer = setTimeout(() => {
        if (tableScrollRef.current) {
          tableScrollRef.current.scrollToEnd({ animated: true });
        }
        // Auto-focus the first input of the new row
        const newRowIdx = currentSession.rounds.length - 1;
        inputRefs.current[`${newRowIdx}-0`]?.focus();
      }, 500); // Reduced delay for better feel
      return () => clearTimeout(timer);
    }
  }, [currentSession?.rounds?.length]);

  const createSession = () => {
    setInputModal({
      visible: true,
      title: 'Bàn mới',
      description: 'Nhập tên để dễ dàng quản lý bàn chơi của bạn',
      placeholder: 'Nhập tên bàn...',
      value: `Bàn ${sessions.length + 1}`,
      type: 'session',
      onConfirm: (name) => {
        const finalName = name.trim() || `Bàn ${sessions.length + 1}`;
        const id = Date.now().toString();
        const newSession = {
          id,
          name: finalName,
          players: ['Người 1', 'Người 2', 'Người 3', 'Người 4'],
          rounds: [['0', '0', '0', '0']],
          baseline: [0, 0, 0, 0], // Store starting/carried over values
          createdAt: new Date().toISOString()
        };
        setSessions([newSession, ...sessions]);
        setCurrentSessionId(newSession.id);
      },
      icon: <Plus size={32} color="#8B0000" />
    });
  };

  const editSessionName = (session) => {
    setInputModal({
      visible: true,
      title: 'Đổi tên bàn',
      description: 'Nhập tên mới cho bàn này',
      placeholder: 'Nhập tên bàn...',
      value: session.name,
      type: 'rename-session',
      onConfirm: (name) => {
        if (name && name.trim()) {
          updateSession({ ...session, name: name.trim() });
        }
      },
      icon: <Settings size={32} color="#8B0000" />
    });
  };

  const renameSession = () => {
    if (!currentSession) return;
    setInputModal({
      visible: true,
      title: 'Đổi tên bàn',
      description: 'Nhập tên mới cho bàn này',
      placeholder: 'Nhập tên bàn...',
      value: currentSession.name,
      type: 'rename-session',
      onConfirm: (name) => {
        if (name && name.trim()) {
          updateSession({ ...currentSession, name: name.trim() });
        }
      },
      icon: <Settings size={32} color="#8B0000" />
    });
  };

  const deleteSession = (id) => {
    Alert.alert('Xóa bàn', 'Bạn có chắc muốn xóa bàn này và toàn bộ dữ liệu của nó?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          setSessions(sessions.filter(s => s.id !== id));
          if (currentSessionId === id) setCurrentSessionId(null);
        }
      }
    ]);
  };



  const updateSession = (updatedSession) => {
    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
  };

  const finalizeRounds = () => {
    if (currentSession.rounds.length === 0) return;

    Alert.alert(
      'Chốt số',
      'Cộng dồn tất cả các vòng hiện tại vào "Dòng 1" và xóa các dòng khác?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chốt',
          style: 'destructive',
          onPress: () => {
            const currentTotals = calculateSessionTotals(currentSession);
            updateSession({
              ...currentSession,
              baseline: currentSession.players.map(() => 0),
              rounds: [currentTotals.map(String)]
            });
          }
        }
      ]
    );
  };

  const addPlayer = () => {
    setInputModal({
      visible: true,
      title: 'Thêm người chơi',
      description: 'Nhập tên người chơi mới',
      placeholder: 'Nhập tên...',
      value: '',
      type: 'player',
      onConfirm: (name) => {
        if (name && name.trim()) {
          const updated = {
            ...currentSession,
            players: [...currentSession.players, name.trim()],
            rounds: currentSession.rounds.map(r => [...r, '0']),
            baseline: currentSession.baseline ? [...currentSession.baseline, 0] : [0]
          };
          updateSession(updated);
        }
      },
      icon: <UserPlus size={32} color="#8B0000" />
    });
  };

  const addRound = () => {
    const newRound = currentSession.players.map(() => '0');
    updateSession({
      ...currentSession,
      rounds: [...currentSession.rounds, newRound]
    });
  };

  const updateRoundValue = (roundIdx, playerIdx, value) => {
    const updatedRounds = [...currentSession.rounds];
    updatedRounds[roundIdx][playerIdx] = value;
    updateSession({ ...currentSession, rounds: updatedRounds });
  };

  const handleInputSubmit = (rIdx, pIdx) => {
    const val = currentSession.rounds[rIdx][pIdx];
    // Requirement 3: If no value, fill 0
    if (val.trim() === '') {
      updateRoundValue(rIdx, pIdx, '0');
    }

    // Requirement 1: Jump to next input
    const nextPIdx = pIdx + 1;
    if (nextPIdx < currentSession.players.length) {
      setTimeout(() => {
        inputRefs.current[`${rIdx}-${nextPIdx}`]?.focus();
      }, 100);
    } else if (rIdx === currentSession.rounds.length - 1) {
      // Last player of the LAST row -> Add new row
      // The auto-scroll useEffect will handle the focus
      addRound();
    }
  };

  const deleteRound = (idx) => {
    Alert.alert('Xóa dòng', 'Bạn có chắc muốn xóa dòng này không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          const updatedRounds = currentSession.rounds.filter((_, i) => i !== idx);
          updateSession({ ...currentSession, rounds: updatedRounds });
        }
      }
    ]);
  };

  const resetData = () => {
    Alert.alert('Cài lại', 'Xóa tất cả dữ liệu trận đấu?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đồng ý',
        style: 'destructive',
        onPress: () => {
          updateSession({
            ...currentSession,
            rounds: [],
            baseline: currentSession.players.map(() => 0)
          });
        }
      }
    ]);
  };

  const editPlayerName = (idx) => {
    setInputModal({
      visible: true,
      title: 'Đổi tên',
      description: 'Nhập tên mới cho người chơi này',
      placeholder: 'Tên người chơi...',
      value: currentSession.players[idx],
      type: 'rename-player',
      onConfirm: (name) => {
        if (name && name.trim()) {
          const updatedPlayers = [...currentSession.players];
          updatedPlayers[idx] = name.trim();
          updateSession({ ...currentSession, players: updatedPlayers });
        }
      },
      icon: <Settings size={32} color="#FF6A88" />
    });
  };

  const removePlayer = (idx) => {
    Alert.alert('Xóa người chơi', `Bạn có chắc muốn xóa ${currentSession.players[idx]}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          const updatedPlayers = currentSession.players.filter((_, i) => i !== idx);
          const updatedRounds = currentSession.rounds.map(r => r.filter((_, i) => i !== idx));
          const updatedBaseline = currentSession.baseline ? currentSession.baseline.filter((_, i) => i !== idx) : [];
          updateSession({
            ...currentSession,
            players: updatedPlayers,
            rounds: updatedRounds,
            baseline: updatedBaseline
          });
        }
      }
    ]);
  }

  const diceInterval = React.useRef(null);
  const rollDice = () => {
    if (isRolling) return;
    setShowDice(true);
    setIsRolling(true);
    setDiceValues([null, null]);
    if (diceInterval.current) clearInterval(diceInterval.current);
    let counter = 0;
    diceInterval.current = setInterval(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      setDiceValues([d1, d2]);
      counter++;
      if (counter > 20) {
        clearInterval(diceInterval.current);
        setIsRolling(false);
      }
    }, 60);
  };

  const shareStandings = async () => {
    try {
      const currentTotals = calculateSessionTotals(currentSession);
      const standings = currentSession.players
        .map((name, i) => `${name}: ${currentTotals[i] > 0 ? '+' : ''}${currentTotals[i]}`)
        .join('\n');

      const message = `🧧 Bảng Điểm - ${currentSession.name} 🧧\n\n${standings}\n\nChúc mừng năm mới! 🎉`;

      await Share.share({
        message,
        title: `Kết quả ${currentSession.name}`,
      });
    } catch (error) {
      console.error('Error sharing standings:', error);
    }
  };

  if (!isLoaded) return null;

  // Table Details Screen logic
  const totals = currentSession ? calculateSessionTotals(currentSession) : [];
  const indexColWidth = 40;
  const sidePadding = 16;
  const availableWidth = windowWidth - indexColWidth - sidePadding - 10;
  const minUsableWidth = 55;
  const calculatedWidth = currentSession ? (availableWidth / Math.max(1, currentSession.players.length)) - 2 : minUsableWidth;
  const isScrollEnabled = calculatedWidth < minUsableWidth;

  const colWidth = isScrollEnabled ? minUsableWidth : calculatedWidth;

  return (
    <SafeAreaProvider>
      <View className="flex-1">
        <StatusBar style="dark" />
        <LinearGradient
          colors={['#FFF8E1', '#FADADD', '#FFF8E1']}
          className="flex-1"
        >
          <StaticBackground />

          {!currentSessionId ? (
            <SessionListComponent
              sessions={sessions}
              setCurrentSessionId={setCurrentSessionId}
              editSessionName={editSessionName}
              deleteSession={deleteSession}
              createSession={createSession}
              GoldCoin={GoldCoin}
            />
          ) : (
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
              {/* Header Icons */}
              <View className="px-5 pt-4 pb-1 flex-row justify-between items-center">
                <View className="flex-1 flex-row">
                  <TouchableOpacity
                    onPress={() => setCurrentSessionId(null)}
                    className="bg-white p-2.5 rounded-full mr-2 shadow-sm active:scale-95"
                  >
                    <ChevronLeft size={22} color="#D41F3D" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={resetData}
                    className="bg-white p-2.5 rounded-full shadow-sm active:scale-95"
                  >
                    <Settings size={22} color="#D41F3D" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={renameSession}
                  className="bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100 max-w-[30%] items-center mx-2"
                >
                  <Text className="text-[#8B0000] font-bold text-base" numberOfLines={1}>{currentSession.name}</Text>
                </TouchableOpacity>

                <View className="flex-1 flex-row justify-end">
                  <TouchableOpacity onPress={addPlayer} className="bg-white p-2.5 rounded-full mr-2 shadow-sm active:scale-95">
                    <UserPlus size={22} color="#D41F3D" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowStats(true)} className="bg-white p-2.5 rounded-full mr-2 shadow-sm active:scale-95">
                    <ChartBar size={22} color="#D41F3D" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={rollDice} className="bg-white p-2 rounded-full shadow-sm active:scale-95">
                    <Dices size={24} color="#D41F3D" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Table Area */}
              <View className="flex-1">
                {isScrollEnabled ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1 }}
                  >
                    <View style={{ width: 'auto', flex: 1 }}>
                      <TableBodyComponent
                        currentSession={currentSession}
                        totals={totals}
                        isHidden={isHidden}
                        indexColWidth={indexColWidth}
                        colWidth={colWidth}
                        tableScrollRef={tableScrollRef}
                        editPlayerName={editPlayerName}
                        removePlayer={removePlayer}
                        deleteRound={deleteRound}
                        updateRoundValue={updateRoundValue}
                        addRound={addRound}
                        finalizeRounds={finalizeRounds}
                        setShowEnd={setShowEnd}
                        isKeyboardVisible={isKeyboardVisible}
                        inputRefs={inputRefs}
                        handleInputSubmit={handleInputSubmit}
                      />
                    </View>
                  </ScrollView>
                ) : (
                  <View style={{ flex: 1 }}>
                    <TableBodyComponent
                      currentSession={currentSession}
                      totals={totals}
                      isHidden={isHidden}
                      indexColWidth={indexColWidth}
                      colWidth={colWidth}
                      tableScrollRef={tableScrollRef}
                      editPlayerName={editPlayerName}
                      removePlayer={removePlayer}
                      deleteRound={deleteRound}
                      updateRoundValue={updateRoundValue}
                      addRound={addRound}
                      finalizeRounds={finalizeRounds}
                      setShowEnd={setShowEnd}
                      isKeyboardVisible={isKeyboardVisible}
                      inputRefs={inputRefs}
                      handleInputSubmit={handleInputSubmit}
                    />
                  </View>
                )}
              </View>
            </SafeAreaView>
          )}

          {/* Modal Overlays */}
          {showDice && (
            <View className="absolute inset-0 bg-black/70 items-center justify-center z-50">
              <View className="bg-white/90 p-8 rounded-[40px] items-center shadow-2xl w-[90%] border border-white/20">
                <Text className="text-gray-500 font-bold mb-8 uppercase tracking-widest text-xs">Dân chơi lắc xí ngầu</Text>
                <View className="flex-row gap-8 mb-8">
                  <RedDie value={diceValues[0]} />
                  <RedDie value={diceValues[1]} />
                </View>
                <View className="items-center">
                  <Text className="text-gray-400 text-sm font-bold uppercase tracking-widest">Quá đã dân chơi ơi!</Text>
                  <Text
                    className="text-[#8B0000] text-6xl font-black mt-2"
                    style={{ transform: [{ scale: !isRolling ? 1.1 : 1 }] }}
                  >
                    {!isRolling ? diceValues[0] + diceValues[1] : '...'}
                  </Text>
                </View>
                {!isRolling && (
                  <View className="mt-10 flex-row gap-4">
                    <TouchableOpacity onPress={rollDice} className="bg-gray-100 px-8 py-4 rounded-2xl active:scale-95">
                      <Text className="text-gray-600 font-bold text-lg">Lắc lại</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowDice(false)}
                      className="overflow-hidden rounded-2xl shadow-lg active:scale-95"
                    >
                      <LinearGradient colors={['#E52B50', '#C41E3A']} className="px-12 py-4">
                        <Text className="text-white font-black text-lg uppercase">Đóng</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Stats Modal Overlay */}
          {showStats && (
            <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
              <View className="bg-white p-7 rounded-[40px] w-[88%] shadow-2xl">
                <Text className="text-[#8B0000] text-2xl font-black mb-6 text-center uppercase tracking-tight">Thống Kê</Text>
                <View className="mb-8">
                  {currentSession.players.map((name, idx) => (
                    <View key={idx} className="flex-row justify-between py-3.5 border-b border-gray-50">
                      <Text className="text-gray-600 font-bold text-base">{name}</Text>
                      <Text className={`font-black text-lg ${totals[idx] >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                        {totals[idx] > 0 ? '+' : ''}{totals[idx]}
                      </Text>
                    </View>
                  ))}
                </View>
                <View className="flex-row w-full gap-3">
                  <TouchableOpacity
                    onPress={shareStandings}
                    className="flex-1 bg-blue-50 py-4 rounded-2xl items-center flex-row justify-center border border-blue-100 shadow-sm"
                  >
                    <Share2 size={20} color="#2563eb" className="mr-2" />
                    <Text className="text-blue-600 font-black uppercase text-sm ml-2">Chia sẻ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowStats(false)}
                    className="flex-1 bg-[#D41F3D] py-4 rounded-2xl items-center shadow-lg active:scale-95"
                  >
                    <Text className="text-white font-black uppercase text-sm">Đóng</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* End Session Modal Overlay */}
          {showEnd && (
            <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
              <View className="bg-white p-7 rounded-[40px] w-[88%] shadow-2xl items-center">
                <View className="bg-red-50 p-4 rounded-full mb-4">
                  <Flag size={40} color="#D41F3D" />
                </View>
                <Text className="text-xl font-black mt-2 mb-2 text-[#8B0000] uppercase tracking-tight">Kết thúc trận?</Text>
                <Text className="text-gray-500 text-center mb-8 px-4 font-medium leading-5">Dữ liệu sẽ được lưu lại. Bạn có thể xóa bàn thủ công ở màn hình chính.</Text>
                <View className="flex-row w-full gap-3">
                  <TouchableOpacity onPress={() => setShowEnd(false)} className="flex-1 bg-gray-100 py-4 rounded-2xl items-center">
                    <Text className="text-gray-500 font-bold">Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setShowEnd(false); setCurrentSessionId(null); }}
                    className="flex-1 bg-[#D41F3D] py-4 rounded-2xl items-center shadow-lg active:scale-95"
                  >
                    <Text className="text-white font-black uppercase">Xác nhận</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Generic Custom Input Modal */}
          <CustomInputModal modal={inputModal} setModal={setInputModal} />
        </LinearGradient>
      </View>
    </SafeAreaProvider>
  );
}
