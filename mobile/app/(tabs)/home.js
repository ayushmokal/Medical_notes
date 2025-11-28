import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../context/auth';
import { TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { initHealthKit, getStepCount } from '../../services/health';

export default function Home() {
    const { logout } = useAuth();
    const [steps, setSteps] = useState(0);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const fetchHealthData = async () => {
            try {
                await initHealthKit();
                setReady(true);
                const stepsToday = await getStepCount();
                setSteps(stepsToday);
            } catch (error) {
                console.log('Error fetching health data:', error);
            }
        };

        fetchHealthData();
    }, []);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Daily Overview</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Readiness Score</Text>
                <Text style={styles.score}>85</Text>
                <Text style={styles.subtitle}>Good recovery!</Text>
            </View>

            <View style={styles.row}>
                <View style={[styles.card, styles.halfCard]}>
                    <Text style={styles.cardTitle}>Steps</Text>
                    <Text style={styles.metricValue}>{Math.round(steps)}</Text>
                    <Text style={styles.metricUnit}>steps</Text>
                </View>
                <View style={[styles.card, styles.halfCard]}>
                    <Text style={styles.cardTitle}>Sleep</Text>
                    <Text style={styles.metricValue}>7h 30m</Text>
                    <Text style={styles.metricUnit}>duration</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={logout}>
                <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 40,
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfCard: {
        width: '48%',
    },
    cardTitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    score: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    metricUnit: {
        fontSize: 12,
        color: '#999',
    },
    subtitle: {
        fontSize: 16,
        color: '#4CAF50',
        marginTop: 5,
    },
    button: {
        backgroundColor: '#FF3B30',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
