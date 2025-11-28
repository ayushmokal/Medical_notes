import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Labs() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Lab Results</Text>
                <TouchableOpacity style={styles.uploadButton}>
                    <Text style={styles.uploadButtonText}>Upload</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeader}>Recent Reports</Text>

            <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateCard}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="document-text-outline" size={32} color="#3b82f6" />
                    </View>
                    <Text style={styles.emptyTitle}>No lab reports yet</Text>
                    <Text style={styles.emptyDesc}>
                        Upload your first lab report to start tracking your health markers and trends over time.
                    </Text>
                    <TouchableOpacity style={styles.mainUploadButton}>
                        <Text style={styles.mainUploadButtonText}>Upload Lab Report</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        paddingTop: 10,
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    uploadButton: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    uploadButtonText: {
        color: '#3b82f6',
        fontWeight: '600',
        fontSize: 14,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '600',
        color: '#f8fafc',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    emptyStateContainer: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
        paddingBottom: 100,
    },
    emptyStateCard: {
        backgroundColor: '#1e293b',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
        borderStyle: 'dashed',
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f8fafc',
        marginBottom: 8,
    },
    emptyDesc: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    mainUploadButton: {
        backgroundColor: '#3b82f6',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    mainUploadButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
