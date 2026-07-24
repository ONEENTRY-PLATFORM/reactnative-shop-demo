import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
  User,
} from '@react-native-google-signin/google-signin';
import React from 'react';
import {signUpUser, useAuth} from '../../../state/contexts/AuthContext';
import {useAppDispatch, useAppSelector} from '../../../state/hooks';
import {defineApi} from '../../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {IError} from 'oneentry/dist/base/utils';
import {navigate} from '../../../navigation/utils/NavigatonRef';

export const useGoogleSignIn = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const {authenticate, validateToken} = useAuth();
  const dispatch = useAppDispatch();

  const createUser = async (userData: User) => {
    try {
      console.log(userData);
      // Replace client_id / client_secret / redirect_uri with values from your
      // own Google Cloud project. Never commit real client secrets.
      const data = await defineApi.AuthProvider.oauth('google_ios', {
        client_id: '',
        client_secret: '',
        code: userData?.serverAuthCode,
        grant_type: 'authorization_code',
        redirect_uri: '',
      } as any);
      console.log('OAuth sign up response:', data);

      // Check for errors
      if ((data as IError)?.statusCode >= 400) {
        throw new Error((data as IError)?.message);
      }

      // Check if we got the access token and refresh token
      if ('accessToken' in data && data.accessToken && data.refreshToken) {
        // oauth() does NOT place tokens in state or trigger saveFunction — set
        // them explicitly on the current instance so the device fingerprint
        // stays stable and the refresh token remains valid.
        await AsyncStorage.setItem('refresh-token', data.refreshToken);
        await AsyncStorage.setItem('provider-marker', 'google_ios');
        defineApi.AuthProvider.setAccessToken(data.accessToken);
        defineApi.AuthProvider.setRefreshToken(data.refreshToken);

        // Fetch user data immediately (without going through authenticate cycle)
        await validateToken();

        Toast.show({
          type: 'success',
          text1: 'Successfully signed in with Google',
        });
        navigate('home');
      } else {
        throw new Error('No access token or refresh token received');
      }
    } catch (e: any) {
      console.error('OAuth sign up failed:', e?.message);
      Toast.show({
        type: 'error',
        text1: 'Google sign in failed',
        text2: e?.message || 'Please try again',
      });
    }
    setIsLoading(false);
  };

  const signIn = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        await createUser(response.data);
      } else {
        // sign in was cancelled by user
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            Toast.show({
              type: 'error',
              text1: 'Sign in already in progress',
            });
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            Toast.show({
              type: 'error',
              text1: 'Play Services not available',
            });
            break;
          default:
            Toast.show({
              type: 'error',
              text1: 'Google sign in failed',
              text2: error.message,
            });
        }
      } else {
        // an error that's not related to google sign in occurred
        Toast.show({
          type: 'error',
          text1: 'An error occurred',
        });
      }
    }
  };
  return {
    signIn,
    isLoading,
  };
};
