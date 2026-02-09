import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Plus } from "lucide-react-native";

const CustomInputModal = React.memo(({ modal, setModal }) => {
  if (!modal.visible) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      className="absolute inset-0 z-[60]"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View
            className="bg-white p-7 rounded-[40px] w-[88%] shadow-2xl items-center"
            onStartShouldSetResponder={() => true}
          >
            <View className="bg-orange-50 p-4 rounded-full mb-4">
              {modal.icon ? (
                React.cloneElement(modal.icon, { color: "#D41F3D", size: 32 })
              ) : (
                <Plus size={32} color="#D41F3D" />
              )}
            </View>
            <Text className="text-xl font-black mb-2 text-[#8B0000] uppercase tracking-tight">
              {modal.title}
            </Text>
            <Text className="text-gray-400 text-center mb-6 font-medium px-2">
              {modal.description}
            </Text>

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
                <Text className="text-white font-black uppercase">
                  Xác nhận
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
});

export default CustomInputModal;
