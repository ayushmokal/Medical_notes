import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useEffect, useState } from 'react';
import { getStepCount, getSleepSamples, getHeartRateVariability, getActiveEnergyBurned, initHealthKit } from '../../services/health';

export default function Timeline() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            await initHealthKit();
            const history = [];
            const now = new Date();

            // Fetch last 7 days
            for (let i = 0; i < 7; i++) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);

                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);

                // Steps
                const steps = await getStepCount(date);

                // Sleep (Sessions ending on this day)
                const sleepStartQuery = new Date(startOfDay);
                sleepStartQuery.setDate(sleepStartQuery.getDate() - 1);
                sleepStartQuery.setHours(18, 0, 0, 0);
                const sleepData = await getSleepSamples(sleepStartQuery, endOfDay);
                const validSleepData = sleepData.filter(s => {
                    const end = new Date(s.endDate);
                    return end.getDate() === date.getDate() &&
                        end.getMonth() === date.getMonth() &&
                        s.value !== 'AWAKE' && s.value !== 'INBED';
                });
                const totalSleep = validSleepData.reduce((acc, curr) => {
                    const duration = (new Date(curr.endDate) - new Date(curr.startDate)) / (1000 * 60 * 60);
                    return acc + duration;
                }, 0);

                // HRV
                const hrvData = await getHeartRateVariability(startOfDay, endOfDay);
                const avgHrv = hrvData.length > 0
                    ? (hrvData.reduce((acc, curr) => acc + curr.value, 0) / hrvData.length) * 1000
                    : 0;

                // Only add if there is some data
                if (steps > 0 || totalSleep > 0 || avgHrv > 0) {
                    history.push({
                        id: date.toISOString(),
                        date: date,
                        type: 'summary',
                        title: 'Daily Health Summary',
                        steps: Math.round(steps),
                        sleep: totalSleep.toFixed(1),
                        hrv: Math.round(avgHrv),
                    });
                }
            }
            setEvents(history);
        } catch (e) {
            console.log("Error fetching history", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Health Timeline</Text>
                <TouchableOpacity style={styles.filterButton} onPress={fetchHistory}>
                    <Ionicons name="refresh" size={20} color="#3b82f6" />
                </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>{events.length} events in the last 7 days</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeFilterContainer}>
                <TouchableOpacity style={[styles.timeChip, styles.activeTimeChip]}>
                    <Text style={[styles.timeChipText, styles.activeTimeChipText]}>7 days</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.timeChip}>
                    <Text style={styles.timeChipText}>30 days</Text>
                </TouchableOpacity>
            </ScrollView>

            <ScrollView style={styles.eventList}>
                {events.map((event) => (
                    <View key={event.id} style={styles.eventCard}>
                        <View style={styles.eventHeader}>
                            <View style={styles.eventIcon}>
                                <Ionicons name="stats-chart" size={20} color="#3b82f6" />
                            </View>
                            <View>
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                <Text style={styles.eventDate}>
                                    {event.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Sleep</Text>
                                <Text style={styles.statValue}>{event.sleep}h</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>HRV</Text>
                                <Text style={styles.statValue}>{event.hrv}ms</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Steps</Text>
                                <Text style={styles.statValue}>{event.steps}</Text>
                            </View>
                        </View>
                    </View>
                ))}

                {events.length === 0 && !isLoading && (
                    <View style={styles.emptyStateContainer}>
                        <View style={styles.emptyStateCard}>
                            <Ionicons name="pulse-outline" size={48} color="#64748b" />
                            <Text style={styles.emptyStateTitle}>No events found</Text>
                            <Text style={styles.emptyStateText}>
                                No health events in the selected time period.
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a', // Dark blue background
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    filterButton: {
        padding: 8,
        backgroundColor: '#1e293b',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#334155',
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: 14,
        paddingHorizontal: 20,
        marginTop: 8,
        marginBottom: 16,
    },
    timeFilterContainer: {
        paddingHorizontal: 20,
        marginBottom: 12,
        flexGrow: 0,
    },
    timeChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#334155',
        marginRight: 8,
    },
    activeTimeChip: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    timeChipText: {
        color: '#cbd5e1',
        fontWeight: '600',
    },
    activeTimeChipText: {
        color: '#fff',
    },
    typeFilterContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
        flexGrow: 0,
    },
    typeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#334155',
        marginRight: 8,
    },
    activeTypeChip: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    chipIcon: {
        marginRight: 6,
    },
    typeChipText: {
        color: '#94a3b8',
        fontWeight: '600',
    },
    activeTypeChipText: {
        color: '#fff',
        fontWeight: '600',
    },
    eventList: {
        paddingHorizontal: 20,
    },
    eventCard: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    eventHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    eventIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    eventTitle: {
        color: '#f8fafc',
        fontSize: 16,
        fontWeight: '600',
    },
    eventDate: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#0f172a',
        padding: 12,
        borderRadius: 12,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        color: '#94a3b8',
        fontSize: 12,
        marginBottom: 4,
    },
    statValue: {
        color: '#f8fafc',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyStateContainer: {
        paddingHorizontal: 20,
        justifyContent: 'center',
        marginTop: 40,
    },
    emptyStateCard: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
        borderStyle: 'dashed',
    },
    emptyStateTitle: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        color: '#94a3b8',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});
