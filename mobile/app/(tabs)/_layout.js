import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Today',
                    tabBarIcon: ({ color }) => <Ionicons name="today" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="timeline"
                options={{
                    title: 'Timeline',
                    tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
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
                name="labs"
                options={{
                    title: 'Labs',
                    tabBarIcon: ({ color }) => <Ionicons name="flask" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
