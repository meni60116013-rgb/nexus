export function calculateKinematics(rpm) {
    return {
        pistonSpeedMps: (rpm * 0.005).toFixed(2),
        strokeStatus: "OPERATIONAL"
    };
}
