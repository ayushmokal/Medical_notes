import { View, Text, StyleSheet, FlatList } from 'react-native';

const MOCK_EVENTS = [
    { id: '1', type: 'score', title: 'Low Recovery', date: 'Today, 8:00 AM', description: 'Your HRV dropped significantly last night.' },
    { id: '2', type: 'lab', title: 'Lipid Panel Uploaded', date: 'Yesterday, 2:30 PM', description: 'Results are ready for review.' },
    { id: '3', type: 'session', title: 'Dr. Smith', date: 'Nov 25, 10:00 AM', description: 'Follow-up on sleep patterns.' },
];

export default function Timeline() {
    const renderItem = ({ item }) => (
        <View style={styles.eventCard}>
            <View style={styles.timeContainer}>
                <Text style={styles.dateText}>{item.date}</Text>
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventDescription}>{item.description}</Text>
                <View style={styles.tagContainer}>
                    <Text style={styles.tagText}>{item.type.toUpperCase()}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Your Timeline</Text>
            <FlatList
                data={MOCK_EVENTS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    eventCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    timeContainer: {
        width: 80,
        borderRightWidth: 1,
        borderRightColor: '#eee',
        marginRight: 15,
        justifyContent: 'center',
    },
    dateText: {
        fontSize: 12,
        color: '#999',
        fontWeight: '600',
    },
    contentContainer: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    eventDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    tagContainer: {
        backgroundColor: '#E3F2FD',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 10,
        color: '#1976D2',
        fontWeight: 'bold',
    },
});
