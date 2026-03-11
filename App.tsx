import './global.css';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LeaderDashboardScreen } from './src/features/schedule/screens/LeaderDashboardScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <LeaderDashboardScreen />
    </SafeAreaProvider>
  );
}
