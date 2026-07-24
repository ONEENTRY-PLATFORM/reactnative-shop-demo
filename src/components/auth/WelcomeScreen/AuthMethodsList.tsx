import React, {useContext, useMemo} from 'react';
import {Platform, ScrollView} from 'react-native';
import Email from './assets/Email.svg';
import Google from './assets/Google.svg';
import BigButton from '../../shared/BigButton';
import CreateAccountButton from '../../shared/CreateAccountButton';
import {navigateAuth} from '../../../navigation/utils/NavigatonRef';
import {LanguageContext} from '../../../state/contexts/LanguageContext';
import ErrorBlock from '../../shared/ErrorBlock';
import {useGetAuthProvidersQuery} from '../../../api/api/RTKApi';
import {useGoogleSignIn} from '../../../components/auth/WelcomeScreen/useGoogleSignIn';
type Props = {};

const AuthMethodsList: React.FC<Props> = ({}) => {
  const {activeLanguage} = useContext(LanguageContext);
  const {data, error, isLoading} = useGetAuthProvidersQuery(activeLanguage);
  const {signIn} = useGoogleSignIn();

  // Keep email + a single Google provider matching the current platform.
  const providers = useMemo(() => {
    if (!data) return [];
    const googleIdentifier =
      Platform.OS === 'ios' ? 'google_ios' : 'google_web';
    return data.filter(
      p =>
        p?.identifier === 'email' || p?.identifier === googleIdentifier,
    );
  }, [data]);

  if (isLoading) {
    return <></>;
  }

  if (error) {
    return <ErrorBlock errorTitle={error.toString()} />;
  }

  return (
    <ScrollView contentContainerStyle={{gap: 20}} scrollEnabled={false}>
      {providers?.map((method, index) => (
        <BigButton
          className={
            method?.identifier === 'email'
              ? 'bg-accent'
              : 'white border-sm border-gray'
          }
          paragraphStyle={{
            color: method?.identifier === 'email' ? 'white' : 'black',
          }}
          action={() =>
            method?.identifier === 'email'
              ? navigateAuth('auth_sign_in', {method: method?.type})
              : signIn()
          }
          key={method?.identifier}
          title={method?.localizeInfos?.title}
          Icon={method?.identifier?.includes('google') ? <Google /> : <Email />}
        />
      ))}
      <CreateAccountButton />
    </ScrollView>
  );
};

export default AuthMethodsList;
