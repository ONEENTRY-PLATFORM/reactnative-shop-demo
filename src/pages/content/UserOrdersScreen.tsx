import React, {useCallback, useContext} from 'react';
import {NavigationProps} from '../../navigation/types/types';
import {AuthContext} from '../../state/contexts/AuthContext';
import {UserOrdersList} from '../../components/content/UserOrdersScreen';
import {useAppDispatch} from '../../state/hooks';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {navigateAuth} from '../../navigation/utils/NavigatonRef';
import {setScreen} from '../../state/reducers/lastVisitedScreenSlice';

const UserOrdersScreen: React.FC<NavigationProps> = () => {
  const {user} = useContext(AuthContext);
  const dispatch = useAppDispatch();
  const params = useRoute();

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        // remember the screen to return to after sign-in, and open the auth
        // flow on top of the drawer (replacing it made sign-in open a new drawer
        // on the home screen instead of returning here)
        dispatch(setScreen(params.name));
        navigateAuth('auth_home');

        return () => {};
      }
    }, [user]),
  );

  return <UserOrdersList />;
};

export default UserOrdersScreen;
