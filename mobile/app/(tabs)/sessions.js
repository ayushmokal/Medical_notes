import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/auth';
import { getPatientByEmail, getDoctorDetails, getPatientSessions } from '../../services/patient';

export default function Sessions() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user?.email) return;

        try {
            // 1. Find patient by email
            const patient = await getPatientByEmail(user.email);

            if (patient) {
                // 2. Get Doctor Details
                if (patient.doctorId) {
                    const docDetails = await getDoctorDetails(patient.doctorId);
                    setDoctor(docDetails);
                }

                // 3. Get Sessions
                const patientSessions = await getPatientSessions(patient.id);
                setSessions(patientSessions);
            }
        } catch (error) {
            console.error("Error fetching session data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.email]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Doctor Sessions</Text>
                <TouchableOpacity style={styles.scheduleButton}>
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.scheduleButtonText}>Schedule</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
                }
            >
                {/* Doctor Info Card (if linked) */}
                {doctor && (
                    <>
                        <Text style={styles.sectionTitle}>Your Doctor</Text>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.doctorName}>{doctor.fullName || 'Doctor'}</Text>
                                    <Text style={styles.specialty}>{doctor.specialty || 'General Practice'}</Text>
                                </View>
                                <View style={styles.statusBadge}>
                                    <Ionicons name="medkit-outline" size={14} color="#3b82f6" />
                                    <Text style={styles.statusText}>{doctor.hospital || 'Clinic'}</Text>
                                </View>
                            </View>
                        </View>
                    </>
                )}

                <Text style={styles.sectionTitle}>Session History</Text>

                {sessions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={48} color="#64748b" />
                        <Text style={styles.emptyStateText}>No sessions found.</Text>
                        <Text style={styles.emptyStateSubtext}>
                            Sessions with your doctor will appear here.
                        </Text>
                    </View>
                ) : (
                    sessions.map((session) => {
                        const date = session.createdAt
                            ? new Date(session.createdAt.seconds * 1000)
                            : new Date();

                        return (
                            <View key={session.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.doctorName}>
                                            {doctor?.fullName || 'Doctor Session'}
                                        </Text>
                                        <Text style={styles.specialty}>
                                            {session.extractedData?.diagnosis || 'Check-up'}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, styles.completedBadge]}>
                                        <Ionicons name="checkmark-circle-outline" size={14} color="#10b981" />
                                        <Text style={[styles.statusText, styles.completedText]}>Completed</Text>
                                    </View>
                                </View>

                                <View style={styles.infoRow}>
                                    <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
                                    <Text style={styles.infoText}>
                                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </Text>
                                    <Ionicons name="time-outline" size={16} color="#94a3b8" style={styles.iconSpacing} />
                                    <Text style={styles.infoText}>
                                        {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                    </Text>
                                </View>

                                {(session.extractedData?.treatmentPlan || session.rawText) && (
                                    <View style={styles.noteContainer}>
                                        <Text style={styles.noteText} numberOfLines={3}>
                                            {session.extractedData?.treatmentPlan || session.rawText}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    scheduleButton: {
        backgroundColor: '#3b82f6',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    scheduleButtonText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 4,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#f8fafc',
        marginTop: 20,
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    specialty: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    completedBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3b82f6',
        marginLeft: 4,
    },
    completedText: {
        color: '#10b981',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        color: '#cbd5e1',
        fontSize: 14,
        marginLeft: 6,
    },
    iconSpacing: {
        marginLeft: 16,
    },
    noteContainer: {
        marginTop: 12,
        backgroundColor: '#0f172a',
        padding: 12,
        borderRadius: 8,
    },
    noteText: {
        color: '#e2e8f0',
        fontSize: 14,
        lineHeight: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 20,
        backgroundColor: '#1e293b',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#334155',
        borderStyle: 'dashed',
    },
    emptyStateText: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptyStateSubtext: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});
