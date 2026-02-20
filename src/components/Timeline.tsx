import React, { useEffect } from "react";
import { FlatList, useWindowDimensions } from "react-native";
import TimelineItem from "@src/components/TimelineItem";

interface Props {
    timelineData: any[];
    flatListRef: any;
    now: any;
    hours: number[];
    theme: {
        primary: string;
        secondary: string;
        text: string;
        logo: any;
    };
    isCompact?: boolean;
}

export default function Timeline({
    timelineData,
    flatListRef,
    now,
    hours,
    theme,
    isCompact = false,
}: Props) {
    const { height } = useWindowDimensions();
    // Distribuir las horas en todo el alto de la pantalla (sin espacios vacíos)
    const itemHeight = Math.floor(height / timelineData.length);

    // Scroll automtico a la hora actual
    useEffect(() => {
        const currentHour = now.hour();
        const indexToScroll = hours.findIndex((h) => h === currentHour);

        if (indexToScroll >= 0 && flatListRef.current) {
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                    index: indexToScroll,
                    animated: true,
                    viewPosition: 0.5,
                });
            }, 400);
        }
    }, [timelineData]);

    return (
        <FlatList
            ref={flatListRef}
            data={timelineData}
            keyExtractor={(item) => item.hour}
            renderItem={({ item }) => (
                <TimelineItem
                    hour={item.hour}
                    events={item.events}
                    isActive={item.isActive}
                    theme={theme}
                    isCompact={isCompact}
                    itemHeight={itemHeight}
                />
            )}
            showsVerticalScrollIndicator={false}
            getItemLayout={(data, index) => ({
                length: itemHeight,
                offset: itemHeight * index,
                index,
            })}
        />
    );
}
