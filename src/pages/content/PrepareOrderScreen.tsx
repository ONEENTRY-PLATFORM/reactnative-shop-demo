import React, {useCallback, useState} from 'react';
import {KeyboardAvoidingView, View} from 'react-native';
import {Screen} from '../../components/ui/templates/Screen';
import {useAuth} from '../../state/contexts/AuthContext';
import ItemsInOrderList from '../../components/content/PrepareOrderScreen/ItemsInOrderList';
import GoToPayButton from '../../components/content/PrepareOrderScreen/GoToPayButton';
import OrderForm from '../../components/content/PrepareOrderScreen/OrderForm';
import OrderTotal from '../../components/content/PrepareOrderScreen/OrderTotal';
import {useAppDispatch} from '../../state/hooks';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {navigateAuth} from '../../navigation/utils/NavigatonRef';
import {setScreen} from '../../state/reducers/lastVisitedScreenSlice';

type Props = object;

const PrepareOrderScreen: React.FC<Props> = () => {
  const [total, setTotal] = useState<number>(0);
  const {user} = useAuth();
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

  return (
    <KeyboardAvoidingView behavior={'position'}>
      <Screen isFull white edges={['horizontal', 'bottom', 'top']}>
        <View className={'h-14'} />
        <ItemsInOrderList setTotal={setTotal} />
        <Screen
          isHideKeyboard
          className={'w-full mt-8 bg-white pb-[85px] flex-1 justify-end'}>
          <OrderForm />
          <OrderTotal total={total} />
          <GoToPayButton />
        </Screen>
      </Screen>
    </KeyboardAvoidingView>
  );
};

export default PrepareOrderScreen;
