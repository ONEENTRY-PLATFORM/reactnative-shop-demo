const {withAndroidManifest} = require('expo/config-plugins');

/**
 * expo-notifications and @react-native-firebase/messaging both register the
 * same <meta-data> tags for FCM notification channel/color/icon, but with
 * different values. Manifest merger sees this as a conflict and fails with
 * `> Manifest merger failed with multiple errors, see logs` on Android builds.
 *
 * The recommended fix is to add `tools:replace` on the affected attributes so
 * our values (from expo-notifications) win over the ones the Firebase library
 * ships. Doing it via a config-plugin keeps it in sync with every
 * `expo prebuild --clean` (a manual edit to AndroidManifest.xml would be
 * overwritten on regeneration).
 */
module.exports = function withFirebaseManifestFix(config) {
  return withAndroidManifest(config, config => {
    const app = config.modResults.manifest.application?.[0];
    if (!app) return config;
    const metas = app['meta-data'] || [];

    const ensureMeta = (name, attr, value) => {
      let node = metas.find(m => m.$?.['android:name'] === name);
      if (!node) {
        node = {$: {'android:name': name}};
        metas.push(node);
      }
      node.$[attr] = value;
      node.$['tools:replace'] = attr;
    };

    ensureMeta(
      'com.google.firebase.messaging.default_notification_channel_id',
      'android:value',
      'default',
    );
    ensureMeta(
      'com.google.firebase.messaging.default_notification_color',
      'android:resource',
      '@color/notification_icon_color',
    );
    ensureMeta(
      'com.google.firebase.messaging.default_notification_icon',
      'android:resource',
      '@drawable/notification_icon',
    );

    app['meta-data'] = metas;
    return config;
  });
};
