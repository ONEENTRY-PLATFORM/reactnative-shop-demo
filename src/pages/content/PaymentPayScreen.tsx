import React, {useCallback, useRef} from 'react';
import {Screen} from '../../components/ui/templates/Screen';
import WebView, {WebViewNavigation} from 'react-native-webview';
import FlexLoader from '../../components/ui/space/FlexLoader';
import {RouteProp, useFocusEffect, useRoute} from '@react-navigation/native';
import {DrawerStackNavigatorParamList} from '../../navigation';
import {navigate} from '../../navigation/utils/NavigatonRef';
import {Modal, View} from 'react-native';
import {useAppNavigation} from '../../navigation/types/types';
import {useAppSelector} from '../../state/hooks';
import BigButton from '../../components/shared/BigButton';
import {Paragraph} from '../../components/ui/texts/Paragraph';
import {useLazyGetPaymentSessionByIdQuery} from '../../api/api/RTKApi';

type Props = object;

const STRIPE_HOSTS = ['stripe.com', 'stripe.network', 'stripecdn.com'];

const isStripeUrl = (url: string): boolean => {
  if (!url) return false;
  if (url.startsWith('about:') || url.startsWith('data:')) return true;
  return STRIPE_HOSTS.some(host => url.includes(host));
};

// Stripe webhooks are async — the OneEntry session may still be "new" at the
// moment Stripe redirects the browser. Poll a few times before deciding.
const resolveSessionStatus = async (
  fetchStatus: () => Promise<{data?: any}>,
  attempts = 5,
  delayMs = 1000,
): Promise<string | undefined> => {
  for (let i = 0; i < attempts; i++) {
    const res = await fetchStatus();
    const status = (res?.data as any)?.status;
    if (status && status !== 'new' && status !== 'pending') {
      return status;
    }
    await new Promise(r => setTimeout(r, delayMs));
  }
  return undefined;
};

/**
 * PaymentPayScreen Component
 *
 * Loads the Stripe checkout URL in a WebView. Any redirect away from a Stripe
 * domain is intercepted — instead of loading it (the CMS success URL points at
 * a Next.js demo that shows its own 401), the app polls the OneEntry session
 * status and routes to an in-app success/failure screen.
 */
const PaymentPayScreen: React.FC<Props> = () => {
  const route =
    useRoute<RouteProp<DrawerStackNavigatorParamList, 'payment_method'>>();
  const id = route.params?.orderId;
  const paymentUrl = route.params?.paymentUrl;
  const [getPaymentStatus] = useLazyGetPaymentSessionByIdQuery();
  const navigation = useAppNavigation();
  const {successful_payment_text, unsuccessful_payment_text} = useAppSelector(
    state => state.systemContentReducer.content,
  );

  // Guards against re-entry: WebView fires onShouldStartLoadWithRequest and
  // onNavigationStateChange multiple times during a single redirect.
  const handledRef = useRef(false);

  const finish = useCallback(
    async (assumeSuccessFromUrl: boolean) => {
      if (handledRef.current) return;
      handledRef.current = true;

      let status: string | undefined;
      if (id) {
        status = await resolveSessionStatus(() => getPaymentStatus({id}));
      }

      const succeeded =
        status === 'completed' ||
        status === 'paid' ||
        (status === undefined && assumeSuccessFromUrl);

      navigate('message', {
        message: succeeded
          ? successful_payment_text
          : unsuccessful_payment_text,
      });
      // @ts-ignore route params typing
      navigation.setParams({orderId: undefined});
    },
    [
      id,
      getPaymentStatus,
      navigation,
      successful_payment_text,
      unsuccessful_payment_text,
    ],
  );

  // Preferred hook: cancel navigation to non-Stripe URLs before the WebView
  // renders someone else's page.
  const onShouldStartLoadWithRequest = useCallback(
    (req: {url: string; isTopFrame?: boolean}) => {
      if (handledRef.current) return false;
      // Stripe Checkout embeds iframes from other hosts (Google Pay, hCaptcha,
      // stripecdn.com): only a top-level navigation leaves the checkout
      if (req.isTopFrame === false) return true;
      if (isStripeUrl(req.url)) return true;
      // Stripe redirect usually carries success/cancel markers in the URL. Use
      // them as a hint; final decision still comes from the session status.
      const looksLikeSuccess =
        /success|complete|paid/i.test(req.url) && !/cancel|fail/i.test(req.url);
      finish(looksLikeSuccess);
      return false;
    },
    [finish],
  );

  // Fallback for platforms/paths where onShouldStartLoadWithRequest doesn't
  // fire (Android POST redirects, iframes, etc.).
  const onNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      if (handledRef.current) return;
      if (isStripeUrl(navState.url)) return;
      const looksLikeSuccess =
        /success|complete|paid/i.test(navState.url) &&
        !/cancel|fail/i.test(navState.url);
      finish(looksLikeSuccess);
    },
    [finish],
  );

  useFocusEffect(
    useCallback(() => {
      if (!handledRef.current && (!id || !paymentUrl)) {
        navigate('home');
      }
    }, [id, paymentUrl]),
  );

  return (
    <Screen isFull white edges={['top', 'horizontal']}>
      <Modal>
        <View className={'h-full pt-12'}>
          <WebView
            cacheEnabled={false}
            startInLoadingState={true}
            renderError={() => (
              <View
                className={
                  'flex-1 items-center justify-center px-layout gap-5'
                }>
                <Paragraph size={24} color={'red'}>
                  {unsuccessful_payment_text}
                </Paragraph>
                <BigButton
                  title={'Try again'}
                  action={() => {
                    navigate('message', {message: unsuccessful_payment_text});
                  }}
                />
              </View>
            )}
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            onNavigationStateChange={onNavigationStateChange}
            renderLoading={() => <FlexLoader />}
            source={{uri: paymentUrl}}
          />
        </View>
      </Modal>
    </Screen>
  );
};

export default PaymentPayScreen;
