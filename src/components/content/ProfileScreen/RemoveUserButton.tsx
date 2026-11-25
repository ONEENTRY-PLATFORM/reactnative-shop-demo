import React, {useState} from 'react';
import {defineApi} from '../../../api';
import {useAuth} from '../../../state/contexts/AuthContext';
import {ActivityIndicator, Alert, TouchableOpacity, View} from 'react-native';
import {Paragraph} from '../../ui/texts/Paragraph';
import {useAppSelector} from '../../../state/hooks';
import {IError} from 'oneentry/dist/base/utils';

type Props = object;

// Fallback when the CMS text (static_content.remove_user_text) is empty:
// the button must never be invisible (App Store requires a findable option).
const DEFAULT_REMOVE_USER_TEXT = 'Delete account';

const RemoveUserButton: React.FC<Props> = () => {
  const {authenticate, logOutUser} = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {remove_user_text} = useAppSelector(
    state => state.systemContentReducer.content,
  );
  const title = remove_user_text || DEFAULT_REMOVE_USER_TEXT;

  const removeUser = async () => {
    try {
      setIsLoading(true);
      const result = await defineApi.Users.deleteUser();

      // the SDK returns the API error instead of throwing
      if ((result as IError)?.statusCode >= 400 || result !== true) {
        throw new Error(
          (result as IError)?.message || 'Failed to delete the account',
        );
      }

      await logOutUser();
      authenticate();
    } catch (e: any) {
      console.log('delete account error', e);
      Alert.alert('Account was not deleted', e?.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Irreversible action: ask before deleting
  const onPress = () => {
    Alert.alert(
      title,
      'Your account and its data will be deleted permanently. This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', style: 'destructive', onPress: removeUser},
      ],
    );
  };

  if (isLoading) {
    return (
      <View className={'w-full items-center mb-4 justify-start'}>
        <ActivityIndicator size={'small'} color={'black'} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className={'w-full items-center mb-4 justify-start'}>
      <Paragraph size={20} color={'red'}>
        {title}
      </Paragraph>
    </TouchableOpacity>
  );
};

export default RemoveUserButton;
