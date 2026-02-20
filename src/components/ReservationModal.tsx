import React from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    Platform,
    StyleSheet,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import dayjs from "dayjs";

interface Props {
    visible: boolean;
    form: {
        subject: string;
        start: string;
        end: string;
    };
    pickerMode: "start" | "end" | null;
    setPickerMode: (mode: "start" | "end" | null) => void;
    onClose: () => void;
    onChange: (key: "subject" | "start" | "end", value: string) => void;
    onSubmit: () => void;
    theme: {
        primary: string;
        secondary: string;
        text: string;
        modalButton?: string;
    };
    validationMessage?: string;
    validationIsError?: boolean;
}

export default function ReservationModal({
    visible,
    form,
    pickerMode,
    setPickerMode,
    onClose,
    onChange,
    onSubmit,
    theme,
    validationMessage = "",
    validationIsError = false,
}: Props) {
    return (
        <Modal
            animationType="slide"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>

                    <Text style={styles.modalTitle}>Nueva Reserva</Text>

                    <Text style={styles.label}>Organizador</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ingresa tu nombre"
                        placeholderTextColor="#888"
                        value={form.subject}
                        onChangeText={(t) => onChange("subject", t)}
                    />

                    {Platform.OS === "web" ? (
                        <>
                            <Text style={styles.label}>Inicio</Text>
                            <View style={styles.input}>
                                <input
                                    type="datetime-local"
                                    style={{
                                        backgroundColor: "transparent",
                                        color: "white",
                                        border: "none",
                                        width: "100%",
                                        outline: "none",
                                    }}
                                    value={
                                        form.start
                                            ? dayjs(form.start).format("YYYY-MM-DDTHH:mm")
                                            : ""
                                    }
                                    onChange={(e) =>
                                        onChange("start", dayjs(e.target.value).toISOString())
                                    }
                                />
                            </View>

                            <Text style={styles.label}>Fin</Text>
                            <View style={styles.input}>
                                <input
                                    type="datetime-local"
                                    style={{
                                        backgroundColor: "transparent",
                                        color: "white",
                                        border: "none",
                                        width: "100%",
                                        outline: "none",
                                    }}
                                    value={
                                        form.end
                                            ? dayjs(form.end).format("YYYY-MM-DDTHH:mm")
                                            : ""
                                    }
                                    onChange={(e) =>
                                        onChange("end", dayjs(e.target.value).toISOString())
                                    }
                                />
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={styles.label}>Inicio</Text>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setPickerMode("start")}
                            >
                                <Text style={{ color: form.start ? "#fff" : "#888" }}>
                                    {form.start
                                        ? dayjs(form.start).format("DD/MM/YYYY HH:mm")
                                        : "Selecciona fecha y hora"}
                                </Text>
                            </TouchableOpacity>

                            <Text style={styles.label}>Fin</Text>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setPickerMode("end")}
                            >
                                <Text style={{ color: form.end ? "#fff" : "#888" }}>
                                    {form.end
                                        ? dayjs(form.end).format("DD/MM/YYYY HH:mm")
                                        : "Selecciona fecha y hora"}
                                </Text>
                            </TouchableOpacity>

                            <DateTimePickerModal
                                isVisible={pickerMode !== null}
                                mode="datetime"
                                onConfirm={(date) => {
                                    const iso = dayjs(date).toISOString();
                                    if (pickerMode === "start") onChange("start", iso);
                                    if (pickerMode === "end") onChange("end", iso);
                                    setPickerMode(null);
                                }}
                                onCancel={() => setPickerMode(null)}
                            />
                        </>
                    )}

                    {validationMessage ? (
                        <Text
                            style={[
                                styles.validationMessage,
                                { color: validationIsError ? "#f44336" : "#4caf50" },
                            ]}
                        >
                            {validationMessage}
                        </Text>
                    ) : null}

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: "#444" }]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                {
                                    backgroundColor: validationIsError ? "#555" : (theme.modalButton || theme.primary),
                                    opacity: validationIsError ? 0.6 : 1,
                                },
                            ]}
                            onPress={onSubmit}
                            disabled={validationIsError}
                        >
                            <Text style={styles.buttonText}>Reservar</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    modalContainer: {
        width: "90%",
        backgroundColor: "#222",
        padding: 20,
        borderRadius: 12,
    },
    modalTitle: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
    },
    label: {
        color: "#aaa",
        marginBottom: 5,
        marginTop: 10,
    },
    validationMessage: {
        marginTop: 12,
        marginBottom: 4,
        fontSize: 13,
        textAlign: "left",
    },
    input: {
        backgroundColor: "#333",
        color: "#fff",
        borderRadius: 8,
        padding: 12,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});
