// Physics simulation parameters and state
export interface SimulationParams {
  // Door parameters (both doors)
  doorMass: number; // kg (M_d)
  doorWidth: number; // meters (W)
  
  // Sliding mass parameters (Door A only)
  slidingMass: number; // kg (m)
  initialRadius: number; // meters (r_1)
  finalRadius: number; // meters (r_2)
  slideDuration: number; // seconds (t_slide)
  
  // Initial conditions
  initialAngularVelocity: number; // rad/s (ω_1)
}

export interface SimulationState {
  time: number;
  isRunning: boolean;
  phase: 'idle' | 'phase1' | 'phase2';
  
  // Door A (sliding mass)
  doorA: {
    angle: number; // radians
    angularVelocity: number; // rad/s
    momentOfInertia: number; // kg⋅m²
    angularMomentum: number; // kg⋅m²/s
    massRadius: number; // current position of sliding mass
  };
  
  // Door B (standard)
  doorB: {
    angle: number;
    angularVelocity: number;
    momentOfInertia: number;
    angularMomentum: number;
  };
}

export interface DataPoint {
  time: number;
  doorA_omega: number;
  doorB_omega: number;
  doorA_I: number;
  doorB_I: number;
  doorA_L: number;
  doorB_L: number;
}

// Calculate moment of inertia for a door (thin rod about end)
// I_d = (1/3) * M * W²
export function calculateDoorMomentOfInertia(mass: number, width: number): number {
  return (1 / 3) * mass * width * width;
}

// Calculate total moment of inertia for Door A (door + point mass)
// I_total = I_d + m * r²
export function calculateTotalMomentOfInertia(
  doorMomentOfInertia: number,
  slidingMass: number,
  radius: number
): number {
  return doorMomentOfInertia + slidingMass * radius * radius;
}

// Calculate angular velocity from conservation of angular momentum
// L = I * ω = constant → ω_2 = ω_1 * I_1 / I_2
export function calculateAngularVelocity(
  angularMomentum: number,
  momentOfInertia: number
): number {
  return angularMomentum / momentOfInertia;
}

// Linear interpolation for sliding mass position
export function interpolateRadius(
  initialRadius: number,
  finalRadius: number,
  progress: number // 0 to 1
): number {
  // Smooth easing function
  const eased = progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  return initialRadius + (finalRadius - initialRadius) * Math.min(1, Math.max(0, eased));
}

// Default simulation parameters
export const defaultParams: SimulationParams = {
  doorMass: 30, // kg
  doorWidth: 1.0, // meters
  slidingMass: 5, // kg
  initialRadius: 0.3, // meters
  finalRadius: 0.8, // meters
  slideDuration: 1.5, // seconds
  initialAngularVelocity: 1.5, // rad/s (reduced for single close)
};

// Maximum angle for door close (90 degrees = π/2)
export const MAX_DOOR_ANGLE = Math.PI / 2;

// Initialize simulation state
export function initializeState(params: SimulationParams): SimulationState {
  const doorMomentOfInertia = calculateDoorMomentOfInertia(params.doorMass, params.doorWidth);
  const initialTotalMomentOfInertia = calculateTotalMomentOfInertia(
    doorMomentOfInertia,
    params.slidingMass,
    params.initialRadius
  );
  const angularMomentum = initialTotalMomentOfInertia * params.initialAngularVelocity;

  return {
    time: 0,
    isRunning: false,
    phase: 'idle',
    doorA: {
      angle: 0,
      angularVelocity: params.initialAngularVelocity,
      momentOfInertia: initialTotalMomentOfInertia,
      angularMomentum: angularMomentum,
      massRadius: params.initialRadius,
    },
    doorB: {
      angle: 0,
      angularVelocity: params.initialAngularVelocity,
      momentOfInertia: doorMomentOfInertia,
      angularMomentum: doorMomentOfInertia * params.initialAngularVelocity,
    },
  };
}

// Update simulation state for one time step
export function updateState(
  state: SimulationState,
  params: SimulationParams,
  deltaTime: number
): SimulationState {
  if (!state.isRunning) return state;

  // Check if both doors have reached max angle - stop simulation
  if (state.doorA.angle >= MAX_DOOR_ANGLE && state.doorB.angle >= MAX_DOOR_ANGLE) {
    return {
      ...state,
      isRunning: false,
      phase: 'phase2',
      doorA: { ...state.doorA, angularVelocity: 0 },
      doorB: { ...state.doorB, angularVelocity: 0 },
    };
  }

  const newTime = state.time + deltaTime;
  const doorMomentOfInertia = calculateDoorMomentOfInertia(params.doorMass, params.doorWidth);

  // Calculate sliding mass position based on time
  const slideProgress = Math.min(1, newTime / params.slideDuration);
  const newMassRadius = interpolateRadius(params.initialRadius, params.finalRadius, slideProgress);

  // Door A: Update with sliding mass
  const newMomentOfInertiaA = calculateTotalMomentOfInertia(
    doorMomentOfInertia,
    params.slidingMass,
    newMassRadius
  );
  
  let newAngularVelocityA = state.doorA.angle >= MAX_DOOR_ANGLE 
    ? 0 
    : calculateAngularVelocity(state.doorA.angularMomentum, newMomentOfInertiaA);
  
  let newAngleA = state.doorA.angle >= MAX_DOOR_ANGLE
    ? MAX_DOOR_ANGLE
    : Math.min(MAX_DOOR_ANGLE, state.doorA.angle + newAngularVelocityA * deltaTime);

  // Door B: Constant rotation (no sliding mass) until max angle
  let newAngularVelocityB = state.doorB.angle >= MAX_DOOR_ANGLE ? 0 : state.doorB.angularVelocity;
  let newAngleB = state.doorB.angle >= MAX_DOOR_ANGLE
    ? MAX_DOOR_ANGLE
    : Math.min(MAX_DOOR_ANGLE, state.doorB.angle + newAngularVelocityB * deltaTime);

  // Determine phase
  let phase: 'idle' | 'phase1' | 'phase2' = 'phase1';
  if (newAngleA >= MAX_DOOR_ANGLE && newAngleB >= MAX_DOOR_ANGLE) {
    phase = 'phase2';
  }

  return {
    ...state,
    time: newTime,
    phase,
    doorA: {
      angle: newAngleA,
      angularVelocity: newAngularVelocityA,
      momentOfInertia: newMomentOfInertiaA,
      angularMomentum: state.doorA.angularMomentum,
      massRadius: newMassRadius,
    },
    doorB: {
      angle: newAngleB,
      angularVelocity: newAngularVelocityB,
      momentOfInertia: state.doorB.momentOfInertia,
      angularMomentum: state.doorB.angularMomentum,
    },
  };
}
