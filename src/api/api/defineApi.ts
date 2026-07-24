import {defineOneEntry} from 'oneentry';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PROJECT_URL, APP_TOKEN} from '@env';

const DEVICE_METADATA_KEY = 'oneentry-device-metadata';

const saveFunction = async (res: string) => {
  try {
    if (res) {
      await AsyncStorage.setItem('refresh-token', res);
    }
  } catch (e) {
    console.log('=>(defineApi.ts) saveFunction error', e);
  }
};

let deviceMetadata: string | undefined;

function buildDefine(
  refreshToken?: string,
  providerMarker?: string,
  langCode?: string,
) {
  const instance = defineOneEntry(PROJECT_URL, {
    langCode: langCode || 'en_US',
    token: APP_TOKEN,
    deviceMetadata,
    auth: {
      saveFunction,
      refreshToken: refreshToken || undefined,
      providerMarker: providerMarker || 'email',
    },
    errors: {
      isShell: true,
    },
  });
  return instance;
}

export let defineApi = buildDefine();

/**
 * Loads a stable device-metadata string from AsyncStorage and pins it to the
 * SDK instance. The API binds refresh tokens to this fingerprint — without
 * persistence between app launches the saved refresh token becomes unusable.
 */
export async function initDeviceMetadata(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(DEVICE_METADATA_KEY);
    if (saved) {
      deviceMetadata = saved;
      defineApi.AuthProvider.setDeviceMetadata(saved);
      return;
    }
    const current = defineApi.AuthProvider.getDeviceMetadata();
    if (current) {
      deviceMetadata = current;
      await AsyncStorage.setItem(DEVICE_METADATA_KEY, current);
    }
  } catch (e) {
    console.log('=>(defineApi.ts) initDeviceMetadata error', e);
  }
}

/**
 * Rebuild the SDK instance. Used for language change and for restoring the
 * session from a persisted refresh token. The captured deviceMetadata is
 * re-applied so the refresh token stays valid across rebuilds.
 */
export function reDefine(
  refreshToken: string,
  providerMarker: string,
  langCode?: string,
) {
  defineApi = buildDefine(refreshToken, providerMarker, langCode);
  if (deviceMetadata) {
    defineApi.AuthProvider.setDeviceMetadata(deviceMetadata);
  }
}
