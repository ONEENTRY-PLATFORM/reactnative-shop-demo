import './global.css';
import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {LanguageProvider} from './src/state/contexts/LanguageContext';
import {Provider} from 'react-redux';
import {setupStore} from './src/state/store';
import {MenuProvider} from 'react-native-popup-menu';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {OpenDrawerProvider} from './src/state/contexts/OpenDrawerContext';
import {LogBox} from 'react-native';
import {AuthProvider} from './src/state/contexts/AuthContext';
import Toast from 'react-native-toast-message';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import MainNavigator from './src/navigation/navigators/MainNavigator';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import enableFetchCurlLogger from './src/utils/enableCurlLogging';
import {PROJECT_URL} from '@env';

// Ignore all log warnings
LogBox.ignoreAllLogs();

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

// Enable curl logging for requests to OneEntry base URL
enableFetchCurlLogger(PROJECT_URL);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // Cache data for 1 minute
    },
  },
});

GoogleSignin.configure({
  webClientId: '', // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
  scopes: [],
  offlineAccess: false, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  hostedDomain: '', // specifies a hosted domain restriction
  iosClientId: '', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
  googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. "GoogleService-Info-Staging"
  openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
  profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
});

// Setup Redux state
const store = setupStore();

// Main App component
function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Provide Redux state to the app */}
      <Provider store={store}>
        {/* Provide language to the app */}
        <LanguageProvider>
          {/* Authentication state */}
          <AuthProvider>
            {/* Load block which marker is system_content */}
            <MenuProvider>
              <OpenDrawerProvider>
                <SafeAreaProvider
                  initialMetrics={{
                    frame: {x: 0, y: 0, width: 0, height: 0},
                    insets: {top: 0, left: 0, right: 0, bottom: 0},
                  }}>
                  {/* Provide keyboard context to the app to properly display the inputs and avoid keyboard */}
                  <KeyboardProvider>
                    <MainNavigator />
                  </KeyboardProvider>
                  <Toast topOffset={60} />
                </SafeAreaProvider>
              </OpenDrawerProvider>
            </MenuProvider>
          </AuthProvider>
        </LanguageProvider>
      </Provider>
    </QueryClientProvider>
  );
}

// Export the App component as the default export
export default App;
