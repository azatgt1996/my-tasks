# Open-source mobile app project (using Vue3 and Ionic8)
Manage your tasks. Major features:
- Convenient, minimal and intuitive design
- Categories
- Priorities
- Notifications
- Filters
- Group operations
- Lightweight app (3 mb)
- Multi Languages
- Dark/light mode

Google play app link: https://play.google.com/store/apps/details?id=com.kvarta.mytasks

Demonstration:

![main](https://play-lh.googleusercontent.com/wl-KOLN9vxs4JjeEInBX7YqVCpGF4oUXO1KewG8EHxzt6sHJL6dxF9IvEq-eeGQRckc=w1024-h576-rw)
![detail_info](https://play-lh.googleusercontent.com/-PEEzyRMe-7PQ4EelRmBZ55hoHwrdeuqIk4i8fpqArNP29CoMJofQxgcv2OC7Ceol9E=w1024-h576-rw)
![group_operations](https://play-lh.googleusercontent.com/RekXDUIWHbavzGO0zGbu6moDx_Jn5aGEy4f7AIHBsrAb5K6pY4AMm4p4M7D2uzhEeCA=w1024-h576-rw)
![menu](https://play-lh.googleusercontent.com/dEfQy_7MZP7vgsg4d64LM16bvN8YIaO2l5NbfPBt7afFW0Y6aUUqN19-JIoUmImkPUc=w1024-h576-rw)
![settings](https://play-lh.googleusercontent.com/b-Tl1nO-G8F4t14FpMVckwSi618W-klnr2V5__SdBffzZHSSL4Tvr0NjWnjmBg_Wjp0=w1024-h576-rw)

# How to start
ionic build\
ionic capacitor add android\
ionic capacitor sync\
cd android && gradlew assembleDebug && cd.. (for debug)\
cd android && gradlew bundleRelease && cd.. (for release)

Add to /android/app/src/main/res/xml/config.xml\
`<preference name="SplashScreenDelay" value="0"/>`

Add to /android/app/src/main/AndroidManifest.xml:
```
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.USE_EXACT_ALARM" />
```

Add to /android/app/build.gradle (for release):
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
