ionic build\
ionic capacitor add android

ionic capacitor sync\
cd android && gradlew assembleDebug && cd.. (for debug)\
cd android && gradlew bundleRelease && cd.. (for release)

add in /android/app/src/main/res/xml/config.xml\
`<preference name="SplashScreenDelay" value="0"/>`

add in /android/app/src/main/AndroidManifest.xml
```
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.USE_EXACT_ALARM" />
```

add in /android/app/build.gradle (for release)
```
android {
    ...
    signingConfigs {
        release {
            storeFile file('keystore.jks')
            storePassword '...'
            keyAlias 'keyalias'
            keyPassword '...'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```