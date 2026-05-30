import { store, persistor } from './src/store/store';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Home from './src/screens/Home';
import Records from './src/screens/Records';
import Rave from './src/screens/Rave';

// Swipeable top-tab navigation between the three screens.
const Tab = createMaterialTopTabNavigator();

export default function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <SafeAreaProvider>
                    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                        <NavigationContainer>
                            <Tab.Navigator>
                                <Tab.Screen name="Home" component={Home} />
                                <Tab.Screen name="Records" component={Records} />
                                <Tab.Screen name="Rave" component={Rave} />
                            </Tab.Navigator>
                        </NavigationContainer>
                    </SafeAreaView>
                </SafeAreaProvider>
            </PersistGate>
        </Provider>
    );
}
