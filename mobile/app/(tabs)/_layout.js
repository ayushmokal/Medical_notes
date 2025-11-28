import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#3b82f6',
            tabBarInactiveTintColor: '#64748b',
            tabBarStyle: {
                backgroundColor: '#0f172a',
                borderTopColor: '#1e293b',
            },
            headerShown: false,
        }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => <Ionicons name="pulse" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="labs"
                options={{
                    title: 'Labs',
                    tabBarIcon: ({ color }) => <Ionicons name="document-text" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="coach"
                options={{
                    title: 'Coach',
                    tabBarIcon: ({ color }) => <Ionicons name="chatbubble-ellipses" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="sessions"
                options={{
                    title: 'Sessions',
                    tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="timeline"
                options={{
                    title: 'Timeline',
                    tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
