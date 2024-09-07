

ionic build
ionic capacitor add android

ionic capacitor sync
cd android && gradlew assembleDebug && cd..


add in config.xml
<preference name="SplashScreenDelay" value="0"/>

add in AndroidManifest.xml
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />