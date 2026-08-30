-repackageclasses 'com.vcore.grid.suite.o'
-allowaccessmodification
-renamesourcefileattribute SourceFile
-keepattributes SourceFile,LineNumberTable,*Annotation*,Signature,InnerClasses,EnclosingMethod

-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
    public static int i(...);
    public static int w(...);
    public static int e(...);
}

-keepclasseswithmembernames,includedescriptorclasses class * { native <methods>; }
-keep class com.vcore.grid.suite.telemetry.NativeBridge { public <methods>; }
-keep class com.vcore.grid.suite.security.IntegrityGuard { public static ** *(...); }
-keepclassmembers class com.vcore.grid.suite.security.IntegrityGuard {
    private static final java.lang.String AUTHOR_SHA256;
    private static final java.lang.String EXPECTED_AUTHOR;
}
-dontwarn kotlin.**
