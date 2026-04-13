import { store } from './src/store/store';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './src/screens/Home';

export default function App() {
    const Tab = createBottomTabNavigator();
    // const Stack = createNativeStackNavigator();

    return (
        <Provider store={store}>
            <NavigationContainer>
                <Tab.Navigator>
                    <Tab.Screen name="home" component={Home} />
                </Tab.Navigator>
            </NavigationContainer>
        </Provider>
    );
}
