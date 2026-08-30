#pragma once
#include <cstdint>
#include <optional>

struct TelemetryFrame {
    uint32_t can_id;
    uint8_t payload[8];
    uint8_t dlc;
    uint64_t timestamp_ms;
};

struct DiagnosticMetrics {
    float rpm;
    float speed_kmh;
    float coolant_temp_c;
    float throttle_pos_pct;
};

class VCoreDataParser {
public:
    static std::optional<DiagnosticMetrics> parseStandardOBD(const TelemetryFrame& frame) {
        if (frame.can_id < 0x7E8 || frame.can_id > 0x7EF) return std::nullopt;
        DiagnosticMetrics metrics{};
        if (frame.payload[1] == 0x41) {
            switch (frame.payload[2]) {
                case 0x0C: metrics.rpm = ((frame.payload[3] * 256.0f) + frame.payload[4]) / 4.0f; break;
                case 0x0D: metrics.speed_kmh = static_cast<float>(frame.payload[3]); break;
                case 0x05: metrics.coolant_temp_c = static_cast<float>(frame.payload[3]) - 40.0f; break;
                case 0x11: metrics.throttle_pos_pct = (frame.payload[3] * 100.0f) / 255.0f; break;
                default: return std::nullopt;
            }
            return metrics;
        }
        return std::nullopt;
    }
};
