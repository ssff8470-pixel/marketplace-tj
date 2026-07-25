// Объявления типов для пакетов без встроенных .d.ts (локальная разработка)

declare module 'react-native' {
  export interface ViewProps {
    style?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }
  export const View: React.ComponentType<ViewProps>;
  export const Text: React.ComponentType<any>;
  export const TextInput: React.ComponentType<any>;
  export const TouchableOpacity: React.ComponentType<any>;
  export const ScrollView: React.ComponentType<any>;
  export const FlatList: React.ComponentType<any>;
  export const ActivityIndicator: React.ComponentType<any>;
  export const KeyboardAvoidingView: React.ComponentType<any>;
  export const StyleSheet: { create: (styles: any) => any };
  export const Platform: { OS: string };
  export const Alert: {
    alert: (title: string, message?: string, buttons?: any[]) => void;
  };
  export const RefreshControl: React.ComponentType<any>;
}

declare module 'expo-status-bar' {
  export const StatusBar: React.ComponentType<any>;
}

declare module 'react-native-safe-area-context' {
  export const SafeAreaProvider: React.ComponentType<any>;
  export const SafeAreaView: React.ComponentType<any>;
  export const useSafeAreaInsets: () => { top: number; bottom: number; left: number; right: number };
}

declare module 'react-native-screens' {
  export const enableScreens: (enable?: boolean) => void;
}

declare module '@react-navigation/native' {
  export const NavigationContainer: React.ComponentType<any>;
  export const useNavigation: <T = any>() => T;
  export const useRoute: <T = any>() => T;
  export const useFocusEffect: (cb: () => void) => void;
  export type NavigationProp<T = any> = any;
  export type RouteProp<T = any> = any;
}

declare module '@react-navigation/native-stack' {
  export const createNativeStackNavigator: () => {
    Navigator: React.ComponentType<any>;
    Screen: React.ComponentType<any>;
    Group: React.ComponentType<any>;
  };
}

declare module '@react-navigation/bottom-tabs' {
  export const createBottomTabNavigator: () => {
    Navigator: React.ComponentType<any>;
    Screen: React.ComponentType<any>;
    Group: React.ComponentType<any>;
  };
}

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
    getAllKeys: () => Promise<string[]>;
    multiGet: (keys: string[]) => Promise<[string, string | null][]>;
    multiSet: (pairs: [string, string][]) => Promise<void>;
    multiRemove: (keys: string[]) => Promise<void>;
    clear: () => Promise<void>;
  };
  export default AsyncStorage;
}
