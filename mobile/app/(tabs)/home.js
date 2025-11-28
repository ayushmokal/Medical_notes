import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/auth';
import { getPatientByEmail } from '../../services/patient';
import { getStepCount, getSleepSamples, getHeartRateVariability, getActiveEnergyBurned, initHealthKit } from '../../services/health';

export default function Dashboard() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [patientName, setPatientName] = useState('Patient');
    const [showProfile, setShowProfile] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Health Data State
    const [steps, setSteps] = useState(0);
    const [sleep, setSleep] = useState(0);
    const [hrv, setHrv] = useState(0);
    const [activeEnergy, setActiveEnergy] = useState(0);

    // Scores
    const [sleepScore, setSleepScore] = useState(0);
    const [recoveryScore, setRecoveryScore] = useState(0);
    const [activityScore, setActivityScore] = useState(0);
    const [overallScore, setOverallScore] = useState(0);

    const [selectedDate, setSelectedDate] = useState(new Date());

    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        // Don't allow future dates
        if (newDate > new Date()) return;
        setSelectedDate(newDate);
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    useEffect(() => {
        if (user?.email) {
            loadPatientName();
        }
        fetchHealthData();
    }, [user, selectedDate]);

    const loadPatientName = async () => {
        const patient = await getPatientByEmail(user.email);
        if (patient?.fullName) {
            setPatientName(patient.fullName.split(' ')[0]); // First name
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const fetchHealthData = async () => {
        try {
            await initHealthKit();

            // Define time window for the selected date
            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(selectedDate);
            if (isToday(selectedDate)) {
                endOfDay.setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds());
            } else {
                endOfDay.setHours(23, 59, 59, 999);
            }

            // Steps
            const stepData = await getStepCount(selectedDate);
            setSteps(Math.round(stepData));

            // Sleep (Sessions ending on this day)
            // Query from yesterday 6PM to today 11:59PM to catch sleep ending today
            const sleepStartQuery = new Date(startOfDay);
            sleepStartQuery.setDate(sleepStartQuery.getDate() - 1);
            sleepStartQuery.setHours(18, 0, 0, 0);

            const sleepData = await getSleepSamples(sleepStartQuery, endOfDay);

            // Filter: End date must be on the selected date
            const validSleepData = sleepData.filter(s => {
                const end = new Date(s.endDate);
                return end.getDate() === selectedDate.getDate() &&
                    end.getMonth() === selectedDate.getMonth();
            });

            const totalSleep = validSleepData.reduce((acc, curr) => {
                return acc + (new Date(curr.endDate) - new Date(curr.startDate)) / (1000 * 60 * 60);
            }, 0);
            setSleep(totalSleep.toFixed(1));

            // HRV
            const hrvData = await getHeartRateVariability(startOfDay, endOfDay);
            const avgHrv = hrvData.length > 0
                ? (hrvData.reduce((acc, curr) => acc + curr.value, 0) / hrvData.length) * 1000
                : 0;
            setHrv(Math.round(avgHrv));

            // Scores Calculation
            const sScore = totalSleep > 0 ? Math.min(100, Math.round((totalSleep / 8) * 100)) : 0;
            const rScore = avgHrv > 0 ? Math.min(100, Math.round((avgHrv / 60) * 100)) : 0;
            const aScore = stepData > 0 ? Math.min(100, Math.round((stepData / 10000) * 100)) : 0;

            // Only calculate overall if we have at least one metric
            const activeMetrics = [sScore, rScore, aScore].filter(s => s > 0).length;
            const oScore = activeMetrics > 0
                ? Math.round((sScore + rScore + aScore) / 3) // Simple average for now
                : 0;

            setSleepScore(sScore);
            setRecoveryScore(rScore);
            setActivityScore(aScore);
            setOverallScore(oScore);

        } catch (e) {
            console.log("Error fetching health data", e);
            // Optional: Set an error state to show in UI
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchHealthData();
        setRefreshing(false);
    }, []);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>
                        {isToday(selectedDate) ? 'Good Morning,' : 'Health Summary'}
                    </Text>
                    <View style={styles.dateNav}>
                        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.navButton}>
                            <Ionicons name="chevron-back" size={24} color="#94a3b8" />
                        </TouchableOpacity>
                        <Text style={styles.dateText}>
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </Text>
                        <TouchableOpacity
                            onPress={() => changeDate(1)}
                            style={[styles.navButton, isToday(selectedDate) && { opacity: 0.3 }]}
                            disabled={isToday(selectedDate)}
                        >
                            <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => setShowProfile(true)}
                >
                    <Ionicons name="person-circle-outline" size={40} color="#cbd5e1" />
                </TouchableOpacity>
            </View>

            {/* Profile Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showProfile}
                onRequestClose={() => setShowProfile(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowProfile(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Profile</Text>
                            <TouchableOpacity onPress={() => setShowProfile(false)}>
                                <Ionicons name="close" size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.profileInfo}>
                            <View style={styles.avatarContainer}>
                                <Ionicons name="person" size={40} color="#3b82f6" />
                            </View>
                            <Text style={styles.profileEmail}>{user?.email}</Text>
                            <Text style={styles.profileRole}>Patient Account</Text>
                        </View>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
                }
            >
                {/* Daily Score Card */}
                <View style={styles.scoreCard}>
                    <View style={styles.scoreHeader}>
                        <Text style={styles.scoreTitle}>Daily Health Score</Text>
                        <Ionicons name="information-circle-outline" size={24} color="#94a3b8" />
                    </View>

                    <View style={styles.scoreCircle}>
                        <Text style={styles.scoreValue}>{overallScore > 0 ? overallScore : '--'}</Text>
                    </View>

                    <Text style={[styles.scoreStatus, { color: overallScore > 0 ? '#10b981' : '#94a3b8' }]}>
                        {overallScore > 80 ? 'Doing Great' : overallScore > 0 ? 'Good' : 'No Data'}
                    </Text>
                    <Text style={styles.scoreDescription}>
                        {overallScore > 0
                            ? 'Your overall health is based on sleep quality, recovery metrics, and daily activity'
                            : 'Syncing health data... Make sure Health permissions are granted.'}
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Score Breakdown</Text>

                {/* Metrics Grid */}
                <View style={styles.metricsGrid}>
                    {/* Sleep Score */}
                    <View style={styles.metricCard}>
                        <View style={styles.metricHeader}>
                            <Text style={styles.metricTitle}>Sleep Score</Text>
                            <View style={[styles.iconBg, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                <Ionicons name="moon" size={20} color="#3b82f6" />
                            </View>
                        </View>
                        <Text style={styles.metricValue}>{sleepScore}</Text>
                        <Text style={[styles.metricStatus, { color: '#10b981' }]}>
                            {sleepScore > 80 ? 'Optimal' : 'Good'}
                        </Text>
                        <Text style={styles.metricDetail}>{sleep}h sleep duration.</Text>
                    </View>

                    {/* Recovery Score */}
                    <View style={styles.metricCard}>
                        <View style={styles.metricHeader}>
                            <Text style={styles.metricTitle}>Recovery Score</Text>
                            <View style={[styles.iconBg, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                <Ionicons name="battery-charging" size={20} color="#10b981" />
                            </View>
                        </View>
                        <Text style={styles.metricValue}>{recoveryScore}</Text>
                        <Text style={[styles.metricStatus, { color: '#10b981' }]}>
                            {recoveryScore > 80 ? 'Recovered' : 'Normal'}
                        </Text>
                        <Text style={styles.metricDetail}>HRV is {hrv}ms.</Text>
                    </View>

                    {/* Activity Score */}
                    <View style={styles.metricCard}>
                        <View style={styles.metricHeader}>
                            <Text style={styles.metricTitle}>Activity Score</Text>
                            <View style={[styles.iconBg, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                                <Ionicons name="flame" size={20} color="#f97316" />
                            </View>
                        </View>
                        <Text style={styles.metricValue}>{activityScore}</Text>
                        <Text style={[styles.metricStatus, { color: '#f59e0b' }]}>
                            {activityScore > 80 ? 'Active' : 'Moderate'}
                        </Text>
                        <Text style={styles.metricDetail}>{steps} steps taken.</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <View style={styles.actionsGrid}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.push('/(tabs)/timeline')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#3b82f6' }]}>
                            <Ionicons name="analytics" size={24} color="#fff" />
                        </View>
                        <Text style={styles.actionText}>View Trends</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <View style={[styles.actionIcon, { backgroundColor: '#8b5cf6' }]}>
                            <Ionicons name="document-text" size={24} color="#fff" />
                        </View>
                        <Text style={styles.actionText}>Upload Labs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <View style={[styles.actionIcon, { backgroundColor: '#10b981' }]}>
                            <Ionicons name="chatbubbles" size={24} color="#fff" />
                        </View>
                        <Text style={styles.actionText}>Ask Coach</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    greeting: {
        fontSize: 16,
        color: '#94a3b8',
    },
    dateNav: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    navButton: {
        padding: 4,
    },
    dateText: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 8,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    profileButton: {
        padding: 4,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    scoreCard: {
        backgroundColor: '#1e293b',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#334155',
    },
    scoreHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    scoreTitle: {
        fontSize: 18,
        color: '#94a3b8',
        fontWeight: '500',
    },
    scoreCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 12,
        borderColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderTopColor: '#3b82f6',
        borderRightColor: '#3b82f6',
        borderLeftColor: '#3b82f6',
    },
    scoreValue: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    scoreStatus: {
        fontSize: 20,
        fontWeight: '600',
        color: '#10b981',
        marginBottom: 8,
    },
    scoreDescription: {
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 14,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f8fafc',
        marginTop: 32,
        marginBottom: 16,
    },
    metricsGrid: {
        gap: 16,
    },
    metricCard: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    metricTitle: {
        fontSize: 16,
        color: '#94a3b8',
        fontWeight: '500',
    },
    iconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    metricValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#f8fafc',
        marginBottom: 4,
    },
    metricStatus: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    metricDetail: {
        fontSize: 14,
        color: '#94a3b8',
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionText: {
        color: '#f8fafc',
        fontSize: 14,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1e293b',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    profileEmail: {
        fontSize: 16,
        color: '#f8fafc',
        fontWeight: '600',
        marginBottom: 4,
    },
    profileRole: {
        fontSize: 14,
        color: '#94a3b8',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
    },
});
