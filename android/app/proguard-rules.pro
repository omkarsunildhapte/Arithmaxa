# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# ── minifyEnabled was flipped on for release builds (build.gradle) ──
# @capacitor/android's own proguard-rules.pro (bundled as a consumer rule)
# already keeps every class extending com.getcapacitor.Plugin wholesale,
# which covers the JS-bridge-facing entry point of every plugin here —
# including the third-party ones (@capacitor-mlkit/text-recognition,
# @capgo/capacitor-speech-recognition, @capacitor/local-llm) that ship no
# consumer rules of their own. These extra rules are a conservative safety
# margin for those three specifically, since their *internal* classes
# (native ML model bindings, reflection-based callbacks) aren't
# necessarily covered by that one bridge-level rule the same way a
# Google-published SDK's own bundled consumer rules would cover it.
#
# IMPORTANT: this hasn't been build-tested on a real device/emulator (not
# possible from this environment) — run a real `bundleRelease`/
# `assembleRelease` and smoke-test AI Chat's camera/OCR and voice input,
# and the on-device LLM toggle, before shipping. If anything breaks only
# in the release build (not debug), it's almost always a stripped class —
# add a targeted `-keep class <the class from the stack trace> { *; }`
# rather than disabling minification again.
-keep class com.arithmaxa.app.** { *; }
-keep class com.google.mlkit.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.mlkit.**
