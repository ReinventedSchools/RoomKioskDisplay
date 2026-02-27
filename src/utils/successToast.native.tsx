import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

const TOAST_SUCCESS_TYPE = "successKiosk";

const toastConfig = {
  [TOAST_SUCCESS_TYPE]: ({ text1 }: { text1?: string }) => (
    <View style={styles.toast}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>✓</Text>
      </View>
      <Text style={styles.text}>{text1 || "Evento creado"}</Text>
    </View>
  ),
};

export function showSuccessToast(message: string = "Evento creado") {
  Toast.show({
    type: TOAST_SUCCESS_TYPE,
    text1: message,
    position: "top",
    topOffset: 34,
    visibilityTime: 1800,
  });
}

export function SuccessToastHost() {
  return <Toast config={toastConfig} />;
}

const styles = StyleSheet.create({
  toast: {
    minWidth: 210,
    maxWidth: 320,
    backgroundColor: "rgba(34,34,34,0.92)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
    gap: 10,
    alignSelf: "center",
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#40CCA1",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 18,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
