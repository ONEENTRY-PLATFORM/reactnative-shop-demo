import {
  createNavigationContainerRef,
  StackActions,
} from '@react-navigation/native';
import {UserStackParamList} from '../types/UserStackParamList';
import {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';

export const navigationRef = createNavigationContainerRef<UserStackParamList>();

export const navigate = (stack: any, params?: any) => {
  if (navigationRef.isReady()) {
    const state = navigationRef.getRootState();
    const top = state?.routes?.[state.index]?.name;
    if (top !== 'Drawer' && state?.routes?.some(r => r.name === 'Drawer')) {
      // The drawer is below the auth or error screen. React Navigation 7
      // `navigate` would push a second drawer instead of going back to it.
      navigationRef.dispatch(
        StackActions.popTo('Drawer', {screen: stack, params}),
      );
      return;
    }
    navigationRef.navigate('Drawer', {screen: stack, params});
  }
};

export const nativeNavigate = (stack: any, params?: any) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(stack, params);
  }
};

export const navigateAuth = (stack: any, params?: any) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Auth', {screen: stack, params});
  }
};

export const navigateError = (page: IPagesEntity) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Error', {page});
  }
};

export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}
