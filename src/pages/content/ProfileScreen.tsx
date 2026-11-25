import React, {useCallback} from 'react';
import {NavigationProps} from '../../navigation/types/types';
import {Screen} from '../../components/ui/templates/Screen';
import {useAuth} from '../../state/contexts/AuthContext';
import {
  ProfileHeader,
  ProfileContent,
  RemoveUserButton,
} from '../../components/content/ProfileScreen';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {navigateAuth} from '../../navigation/utils/NavigatonRef';
import {useAppDispatch} from '../../state/hooks';
import {setScreen} from '../../state/reducers/lastVisitedScreenSlice';

const ProfileScreen: React.FC<NavigationProps> = () => {
  const {user} = useAuth();
  const [editing, setEditing] = React.useState<boolean>(false);
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

  if (!user) {
    return null;
  }

  return (
    <Screen isHideKeyboard isFull white edges={['horizontal', 'bottom']}>
      <ProfileHeader editing={editing} setEditing={setEditing} />
      <ProfileContent editing={editing} setEditing={setEditing} />
      <RemoveUserButton />
    </Screen>
  );
};

export default ProfileScreen;
