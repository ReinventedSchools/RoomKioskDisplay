import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, useWindowDimensions } from 'react-native';
import colors from '../config/colors';
import fonts from '../config/fonts';
import dayjs from 'dayjs';

interface ClockDisplayProps {
    /** En horizontal: fecha arriba, reloj grande debajo. En vertical: inline junto a la fecha */
    stacked?: boolean;
}

const ClockDisplay = ({ stacked = false }: ClockDisplayProps) => {
    const [time, setTime] = useState(dayjs());
    const { width, height } = useWindowDimensions();
    const isPortrait = height > width;
    // Horizontal: legible pero no dominante (48-64px según pantalla)
    // Vertical: más pequeño para ahorrar espacio
    const clockSize = stacked
        ? Math.min(64, Math.max(48, height * 0.12))
        : isPortrait
          ? fonts.clock * 0.25
          : fonts.clock * 0.4;

    useEffect(() => {
        const timer = setInterval(() => setTime(dayjs()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <Text
            style={[
                styles.clock,
                { fontSize: clockSize },
                !stacked && styles.clockInline,
            ]}
        >
            {time.format('HH:mm')}
        </Text>
    );
};

const styles = StyleSheet.create({
    clock: {
        color: colors.text,
    },
    clockInline: {
        marginLeft: 8,
    },
});

export default ClockDisplay;
