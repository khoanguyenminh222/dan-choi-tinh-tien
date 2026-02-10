import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, useWindowDimensions, Share, Keyboard, BackHandler, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import PremiumSplash from './components/PremiumSplash';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, Settings, ChartBar, Dices, ChevronLeft, UserPlus, Share2, Heart, Flag } from 'lucide-react-native';
import "./global.css";

import { calculateSessionTotals, calculateAdjustedTotals } from './utils/gameLogic';
import RedDie from './components/RedDie';
import GoldCoin from './components/GoldCoin';
import StaticBackground from './components/StaticBackground';
import CustomInputModal from './components/CustomInputModal';
import SessionListComponent from './components/SessionListComponent';
import TableBodyComponent from './components/TableBodyComponent';
import DiceModal from './components/DiceModal';

const STORAGE_KEY = '@gamble_tracker_data';

export default function App() {
  const { width: windowWidth } = useWindowDimensions();
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPremiumSplash, setShowPremiumSplash] = useState(true);

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
  const [isUyenMode, setIsUyenMode] = useState(false); // New state for Uyen Mode
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

  // Handle Android Back Button
  useEffect(() => {
    const backAction = () => {
      // 1. Close Input Modal if open
      if (inputModal.visible) {
        setInputModal(prev => ({ ...prev, visible: false }));
        return true;
      }

      // 2. Close other overhead modals
      if (showDice) {
        setShowDice(false);
        return true;
      }
      if (showStats) {
        setShowStats(false);
        return true;
      }
      if (showEnd) {
        setShowEnd(false);
        return true;
      }

      // 3. Return to Session List if in a session
      if (currentSessionId) {
        setCurrentSessionId(null);
        return true;
      }

      // 4. Default behavior (exit app)
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [inputModal.visible, showDice, showStats, showEnd, currentSessionId]);

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
        // Always scroll to end when rounds are added to ensure visibility
        if (tableScrollRef.current) {
          tableScrollRef.current.scrollToEnd({ animated: true });
        }

        // Auto-focus the first editable input of the new row (skip dealer)
        const newRowIdx = currentSession.rounds.length - 1;
        let firstEditableIdx = 0;

        if (currentSession.dealerIndex === 0) {
          firstEditableIdx = 1;
        }

        inputRefs.current[`${newRowIdx}-${firstEditableIdx}`]?.focus();
      }, 300); // Reduced delay for snappier feel
      return () => clearTimeout(timer);
    }
  }, [currentSession?.rounds?.length, currentSessionId]);

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
          rounds: [['', '', '', '']],
          baseline: [0, 0, 0, 0], // Store starting/carried over values
          dealerIndex: null, // Thêm chỉ số nhà cái
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
            rounds: currentSession.rounds.map(r => [...r, '']),
            baseline: currentSession.baseline ? [...currentSession.baseline, 0] : [0],
            dealerIndex: currentSession.dealerIndex // Giữ nguyên index nhà cái
          };
          updateSession(updated);
        }
      },
      icon: <UserPlus size={32} color="#8B0000" />
    });
  };

  const addRound = () => {
    const newRound = currentSession.players.map(() => '');
    updateSession({
      ...currentSession,
      rounds: [...currentSession.rounds, newRound]
    });
  };

  const updateRoundValue = (roundIdx, playerIdx, value) => {
    const updatedRounds = [...currentSession.rounds];
    updatedRounds[roundIdx][playerIdx] = value;

    // Tự động tính điểm nhà cái nếu có
    if (currentSession.dealerIndex !== null) {
      const dealerIdx = currentSession.dealerIndex;
      let otherTotal = 0;
      updatedRounds[roundIdx].forEach((v, idx) => {
        if (idx !== dealerIdx) {
          const num = parseFloat(v || 0);
          otherTotal += isNaN(num) ? 0 : num;
        }
      });
      updatedRounds[roundIdx][dealerIdx] = String(-otherTotal);
    }

    updateSession({ ...currentSession, rounds: updatedRounds });
  };

  const handleInputSubmit = (rIdx, pIdx) => {
    const val = currentSession.rounds[rIdx][pIdx];
    // Removed auto-fill 0 on submit

    // Requirement 1: Jump to next input (skip dealer)
    let nextPIdx = pIdx + 1;

    // Tìm ô tiếp theo có thể nhập (bỏ qua nhà cái)
    while (nextPIdx < currentSession.players.length && currentSession.dealerIndex === nextPIdx) {
      nextPIdx++;
    }

    if (nextPIdx < currentSession.players.length) {
      // Còn ô trong cùng dòng
      setTimeout(() => {
        inputRefs.current[`${rIdx}-${nextPIdx}`]?.focus();
      }, 100);
    } else if (rIdx === currentSession.rounds.length - 1) {
      // Hết dòng cuối -> Thêm dòng mới
      addRound();
    } else {
      // Nhảy sang dòng tiếp theo, ô đầu tiên (hoặc bỏ qua nhà cái nếu là ô 0)
      const nextRowIdx = rIdx + 1;
      let firstEditableIdx = 0;
      if (currentSession.dealerIndex === 0) {
        firstEditableIdx = 1;
      }
      setTimeout(() => {
        inputRefs.current[`${nextRowIdx}-${firstEditableIdx}`]?.focus();
      }, 100);
    }
  };

  const deleteRound = (idx) => {
    if (idx !== currentSession.rounds.length - 1) {
      Alert.alert('Không thể xóa', 'Bạn chỉ có thể xóa dòng cuối cùng.');
      return;
    }
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
    const isDealer = currentSession.dealerIndex === idx;

    Alert.alert(
      'Tùy chọn người chơi',
      `Bạn muốn làm gì với ${currentSession.players[idx]}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đổi tên',
          onPress: () => {
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
          }
        },
        {
          text: isDealer ? 'Hủy làm Cái' : 'Chọn làm Cái',
          onPress: () => toggleDealer(idx)
        },
        {
          text: 'Xóa người chơi',
          style: 'destructive',
          onPress: () => removePlayer(idx)
        }
      ]
    );
  };

  const toggleDealer = (idx) => {
    const newDealerIndex = currentSession.dealerIndex === idx ? null : idx;
    updateSession({ ...currentSession, dealerIndex: newDealerIndex });
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
      // 1. Calculate Debt from Uyen (Logic moved to calculateAdjustedTotals)
      // We need to keep debt calculation here only for MESSAGE generation if needed, 
      // but calculateAdjustedTotals already returns the final numbers.

      // Re-implementing logic using the helper for consistency
      const adjustedTotals = calculateAdjustedTotals(currentSession, currentTotals, isUyenMode);

      // Recalculate debt just for the message logic (finding who paid)
      let debt = 0;
      if (isUyenMode) {
        currentSession.players.forEach((p, i) => {
          if (p.toLowerCase().includes('uyên') && currentTotals[i] < 0) {
            debt += Math.abs(currentTotals[i]) * 2;
          }
        });
      }

      const standings = currentSession.players
        .map((name, i) => {
          let score = adjustedTotals[i];
          let extraMsg = '';
          const isUyen = name.toLowerCase().includes('uyên');
          const isKhoa = name.toLowerCase().includes('khoa');
          const isDealer = i === currentSession.dealerIndex;

          if (isUyenMode) {
            if (isUyen && currentTotals[i] < 0) {
              extraMsg = ' (✨ Kích hoạt năng lực ẩn: Người yêu Khoa Ryo ✨)';
            } else if (debt > 0) {
              // Check if this person paid the debt
              let targetIdx = currentSession.players.findIndex(p => p.toLowerCase().includes('khoa'));
              if (targetIdx === -1) targetIdx = currentSession.dealerIndex;

              if (i === targetIdx) {
                extraMsg = isKhoa ? ' (Chuyện khó để anh lo 💸)' : ' (Nhà cái chịu trận 💸)';
              }
            }
          }

          return `${name}: ${score > 0 ? '+' : ''}${score}${extraMsg}`;
        })
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

  if (showPremiumSplash || !isLoaded) {
    return <PremiumSplash onFinish={() => setShowPremiumSplash(false)} isDataLoaded={isLoaded} />;
  }


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
                        totals={calculateAdjustedTotals(currentSession, totals, isUyenMode)}
                        isHidden={isHidden}
                        setIsHidden={setIsHidden}
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
                        isUyenMode={isUyenMode}
                        setIsUyenMode={setIsUyenMode}
                      />
                    </View>
                  </ScrollView>
                ) : (
                  <View style={{ flex: 1 }}>
                    <TableBodyComponent
                      currentSession={currentSession}
                      totals={calculateAdjustedTotals(currentSession, totals, isUyenMode)}
                      isHidden={isHidden}
                      setIsHidden={setIsHidden}
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
                      isUyenMode={isUyenMode}
                      setIsUyenMode={setIsUyenMode}
                    />
                  </View>
                )}
              </View>
            </SafeAreaView>
          )}

          {/* Modal Overlays */}
          <DiceModal
            visible={showDice}
            onClose={() => setShowDice(false)}
            diceValues={diceValues}
            isRolling={isRolling}
            rollDice={rollDice}
            RedDie={RedDie}
          />

          {/* Stats Modal Overlay */}
          {showStats && (
            <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
              <View className="bg-white p-7 rounded-[40px] w-[88%] shadow-2xl relative">
                {currentSession.rounds.length > 6 && currentSession.players.some((p, i) => p.toLowerCase().includes('uyên') && totals[i] < 0) && (
                  <TouchableOpacity
                    onPress={() => setIsUyenMode(!isUyenMode)}
                    className={`absolute top-6 right-6 z-10 flex-row items-center px-3 py-1.5 rounded-full border ${isUyenMode ? 'bg-pink-50 border-pink-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <Text className={`mr-1.5 text-[10px] font-bold uppercase ${isUyenMode ? 'text-pink-500' : 'text-gray-400'}`}>
                      {isUyenMode ? 'Uyên Mode' : 'Uyên Mode'}
                    </Text>
                    <Heart
                      size={14}
                      fill={isUyenMode ? "#FF69B4" : "transparent"}
                      color={isUyenMode ? "#FF69B4" : "#ccc"}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setIsUyenMode(!isUyenMode)} activeOpacity={1}>
                  <Text className="text-[#8B0000] text-2xl font-black mb-6 text-center uppercase tracking-tight">Thống Kê</Text>
                </TouchableOpacity>
                <View className="mb-8">
                  {currentSession.players.map((name, idx) => {
                    let finalScore = totals[idx];
                    let showHiddenMsg = false;
                    let showDebtMsg = '';

                    if (isUyenMode) {
                      // 1. Calculate Debt
                      let debt = 0;
                      currentSession.players.forEach((p, i) => {
                        if (p.toLowerCase().includes('uyên') && totals[i] < 0) {
                          debt += Math.abs(totals[i]) * 2;
                        }
                      });

                      // 2. Determine who pays
                      let payerIdx = currentSession.players.findIndex(p => p.toLowerCase().includes('khoa'));
                      if (payerIdx === -1) payerIdx = currentSession.dealerIndex;

                      // 3. Apply changes
                      if (name.toLowerCase().includes('uyên') && totals[idx] < 0) {
                        finalScore = Math.abs(finalScore);
                        showHiddenMsg = true;
                      } else if (idx === payerIdx && debt > 0) {
                        finalScore -= debt;
                        showDebtMsg = name.toLowerCase().includes('khoa') ? '(Chuyện khó để anh lo 💸)' : '(Nhà cái chịu trận 💸)';
                      }
                    }

                    return (
                      <View key={idx} className="py-3.5 border-b border-gray-50">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-gray-600 font-bold text-base">
                            {name} {showDebtMsg ? <Text className="text-[10px] text-red-500 font-normal">{showDebtMsg}</Text> : null}
                          </Text>
                          <Text className={`font-black text-lg ${finalScore >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                            {finalScore > 0 ? '+' : ''}{finalScore}
                          </Text>
                        </View>
                        {showHiddenMsg && (
                          <Text className="text-[#FF69B4] text-[10px] font-bold italic mt-1 text-right">
                            ✨ Kích hoạt năng lực ẩn: Người yêu Khoa Ryo ✨
                          </Text>
                        )}
                      </View>
                    );
                  })}
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

          {/* Floating Uyen Mode Badge */}
          {currentSessionId && currentSession.rounds.length > 6 && currentSession?.players?.some((p, i) => p.toLowerCase().includes('uyên') && (totals[i] < 0 || isUyenMode)) && !isKeyboardVisible && (
            <TouchableOpacity
              onPress={() => setIsUyenMode(!isUyenMode)}
              className={`absolute bottom-24 right-5 px-4 py-2 rounded-full shadow-2xl flex-row items-center z-40 ${isUyenMode ? 'bg-pink-100 border-2 border-pink-300' : 'bg-white/95 border border-gray-200'}`}
              activeOpacity={0.7}
            >
              <Heart size={14} color={isUyenMode ? "#FF69B4" : "#ccc"} fill={isUyenMode ? "#FF69B4" : "transparent"} />
              <Text className={`ml-2 text-[11px] font-black uppercase ${isUyenMode ? 'text-pink-500' : 'text-gray-400'}`}>
                Uyên Mode
              </Text>
            </TouchableOpacity>
          )}

          {/* Generic Custom Input Modal */}
          <CustomInputModal modal={inputModal} setModal={setInputModal} />
        </LinearGradient>
      </View>
    </SafeAreaProvider>
  );
}
