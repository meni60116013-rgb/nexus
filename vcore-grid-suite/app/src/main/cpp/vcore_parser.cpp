#include <jni.h>
#include "vcore_parser.h"

extern "C" JNIEXPORT jfloat JNICALL
Java_com_vcore_grid_suite_telemetry_NativeBridge_parseRpm(
        JNIEnv* env, jobject, jbyteArray rawPayload) {
    jbyte* buffer = env->GetByteArrayElements(rawPayload, nullptr);
    TelemetryFrame frame{};
    frame.can_id = 0x7E8;
    for(int i = 0; i < 8; i++) frame.payload[i] = static_cast<uint8_t>(buffer[i]);
    env->ReleaseByteArrayElements(rawPayload, buffer, JNI_ABORT);
    auto result = VCoreDataParser::parseStandardOBD(frame);
    return result.has_value() ? result->rpm : -1.0f;
}
