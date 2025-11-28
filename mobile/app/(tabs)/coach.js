import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCoachResponse } from '../../services/ai';
import { getStepCount, getSleepSamples, getHeartRateVariability, initHealthKit } from '../../services/health';
import { useAuth } from '../../context/auth';
import { getPatientByEmail, getPatientSessions } from '../../services/patient';

export default function Coach() {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: "Hello! I'm your AI Health Coach. I'm here to help you understand your health data and provide personalized guidance based on your sleep, recovery, and activity patterns. How can I help you today?",
            sender: 'bot',
            timestamp: '10:11 PM'
        },
    ]);

    const suggestions = [
        "Why is my recovery score low?",
        "How can I improve my sleep?",
        "Analyze my recent lab results"
    ];

    const sendMessage = async () => {
        if (!message.trim()) return;

        const userMsgText = message;
        const newMsg = { id: Date.now().toString(), text: userMsgText, sender: 'user', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, newMsg]);
        setMessage('');

        // Add "Thinking..." placeholder
        const thinkingId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: thinkingId, text: "Thinking...", sender: 'bot', timestamp: '', isThinking: true }]);

        try {
            // Fetch latest health data for context
            await initHealthKit();
            const now = new Date();
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            // Fetch basic metrics for context
            const stepData = await getStepCount(now);

            // Sleep (Last night)
            const sleepStart = new Date(startOfDay);
            sleepStart.setDate(sleepStart.getDate() - 1);
            sleepStart.setHours(18, 0, 0, 0);
            const sleepData = await getSleepSamples(sleepStart, now);
            const totalSleep = sleepData.reduce((acc, curr) => acc + (new Date(curr.endDate) - new Date(curr.startDate)) / (1000 * 60 * 60), 0);

            // HRV
            const hrvData = await getHeartRateVariability(startOfDay, now);
            const avgHrv = hrvData.length > 0 ? (hrvData.reduce((acc, curr) => acc + curr.value, 0) / hrvData.length) * 1000 : 0;

            // Simple Score Calc (Mirroring home.js logic)
            const sScore = totalSleep > 0 ? Math.min(100, Math.round((totalSleep / 8) * 100)) : 0;
            const rScore = avgHrv > 0 ? Math.min(100, Math.round((avgHrv / 60) * 100)) : 0;
            const aScore = stepData > 0 ? Math.min(100, Math.round((stepData / 10000) * 100)) : 0;
            const activeMetrics = [sScore, rScore, aScore].filter(s => s > 0).length;
            const oScore = activeMetrics > 0 ? Math.round((sScore + rScore + aScore) / 3) : 0;

            const healthContext = {
                steps: Math.round(stepData),
                sleep: totalSleep.toFixed(1),
                hrv: Math.round(avgHrv),
                sleepScore: sScore,
                recoveryScore: rScore,
                activityScore: aScore,
                overallScore: oScore
            };

            // Fetch Patient Sessions
            let sessions = [];
            if (user?.email) {
                const patient = await getPatientByEmail(user.email);
                if (patient?.id) {
                    sessions = await getPatientSessions(patient.id);
                }
            }

            // Get AI Response with Session Context
            const aiResponse = await getCoachResponse(userMsgText, healthContext, sessions);

            // Replace "Thinking..." with actual response
            setMessages(prev => prev.map(msg =>
                msg.id === thinkingId
                    ? { ...msg, text: aiResponse, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isThinking: false }
                    : msg
            ));

        } catch (error) {
            console.error("Coach Error:", error);
            setMessages(prev => prev.map(msg =>
                msg.id === thinkingId
                    ? { ...msg, text: "Sorry, I'm having trouble connecting right now.", isThinking: false }
                    : msg
            ));
        }
    };

    const renderItem = ({ item }) => (
        <View style={[
            styles.messageBubble,
            item.sender === 'user' ? styles.userBubble : styles.botBubble
        ]}>
            {item.sender === 'bot' && (
                <View style={styles.botAvatar}>
                    <Ionicons name="logo-android" size={16} color="#fff" />
                </View>
            )}
            <View>
                <Text style={[
                    styles.messageText,
                    item.sender === 'user' ? styles.userText : styles.botText
                ]}>{item.text}</Text>
                <Text style={[
                    styles.timestamp,
                    item.sender === 'user' ? styles.userTimestamp : styles.botTimestamp
                ]}>{item.timestamp}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>AI Health Coach</Text>
            </View>

            {/* Warning Banner */}
            <View style={styles.warningBanner}>
                <Text style={styles.warningText}>
                    AI Coach provides general wellness information. Always consult healthcare professionals for medical advice.
                </Text>
            </View>

            {/* Status Row */}
            <View style={styles.statusRow}>
                <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Online</Text>
                </View>
                <Text style={styles.statusSubtext}>Powered by AI • Personalized guidance</Text>
            </View>

            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.chatContent}
            />

            {/* Suggestions */}
            <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsLabel}>Try asking about:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
                    {suggestions.map((suggestion, index) => (
                        <TouchableOpacity key={index} style={styles.suggestionChip} onPress={() => setMessage(suggestion)}>
                            <Text style={styles.suggestionText}>{suggestion}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                style={styles.inputContainer}
            >
                <TextInput
                    style={styles.input}
                    placeholder="Ask about your health data..."
                    placeholderTextColor="#94a3b8"
                    value={message}
                    onChangeText={setMessage}
                />
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                    <Ionicons name="paper-plane" size={20} color="#fff" />
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    warningBanner: {
        backgroundColor: '#1e293b',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    warningText: {
        color: '#94a3b8',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10b981',
        marginRight: 4,
    },
    statusText: {
        color: '#10b981',
        fontSize: 12,
        fontWeight: '600',
    },
    statusSubtext: {
        color: '#64748b',
        fontSize: 12,
    },
    chatContent: {
        padding: 20,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        flexDirection: 'row',
    },
    userBubble: {
        backgroundColor: '#3b82f6',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    botBubble: {
        backgroundColor: '#1e293b',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#334155',
    },
    botAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        marginTop: -4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: '#fff',
    },
    botText: {
        color: '#e2e8f0',
    },
    timestamp: {
        fontSize: 10,
        marginTop: 4,
    },
    userTimestamp: {
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'right',
    },
    botTimestamp: {
        color: '#64748b',
    },
    suggestionsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    suggestionsLabel: {
        color: '#94a3b8',
        fontSize: 12,
        marginBottom: 8,
        marginLeft: 4,
    },
    suggestionsScroll: {
        flexGrow: 0,
    },
    suggestionChip: {
        backgroundColor: '#1e293b',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#334155',
    },
    suggestionText: {
        color: '#cbd5e1',
        fontSize: 13,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#1e293b',
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    input: {
        flex: 1,
        backgroundColor: '#0f172a',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginRight: 12,
        fontSize: 16,
        color: '#f8fafc',
        borderWidth: 1,
        borderColor: '#334155',
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
