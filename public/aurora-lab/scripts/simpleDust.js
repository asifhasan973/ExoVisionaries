// simpleDust.js - Simple working dust particle system
import { THREE, scene } from './scene-core.js';

let dustParticles = [];

// Create massive angry sun dust storm
export function createSimpleDust(origin, target, speed = 1.0) {

    // Create a particle system with small particles around the sun
    const particleCount = 6000; // MUCH higher density for dense cloud
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Initialize particles around the entire sun surface
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Create particles on the surface of the sun (spherical distribution)
        const radius = 15; // Sun radius
        const theta = Math.random() * Math.PI * 2; // Random angle around sun
        const phi = Math.random() * Math.PI; // Random elevation

        positions[i3] = origin.x + radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = origin.y + radius * Math.cos(phi);
        positions[i3 + 2] = origin.z + radius * Math.sin(phi) * Math.sin(theta);

        // Bright red color
        colors[i3] = 1.0;     // Full red
        colors[i3 + 1] = 0.0; // No green
        colors[i3 + 2] = 0.0; // No blue
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 1.0, // Very small dust particles
        vertexColors: true,
        transparent: true,
        opacity: 0.7, // Good opacity for small particles
        sizeAttenuation: false, // Don't make smaller with distance
        blending: THREE.AdditiveBlending // Glowing effect
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Create individual velocities for each particle (outward from sun surface)
    const velocities = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Calculate direction from sun center to particle position
        const particlePos = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
        const direction = particlePos.clone().sub(origin).normalize();

        // Set velocity in outward direction
        velocities[i3] = direction.x * 1.5; // Outward X velocity
        velocities[i3 + 1] = direction.y * 1.5; // Outward Y velocity
        velocities[i3 + 2] = direction.z * 1.5; // Outward Z velocity
    }

    // Store particle data with individual velocities
    const dustData = {
        mesh: particles,
        positions: positions,
        velocities: velocities,
        origin: origin.clone(),
        target: target.clone(),
        speed: speed, // Use passed speed parameter
        isActive: true
    };

    dustParticles.push(dustData);
    return dustData;
}

// Update all dust particles
export function updateSimpleDust() {
    for (let i = dustParticles.length - 1; i >= 0; i--) {
        const dust = dustParticles[i];

        if (!dust.isActive) {
            scene.remove(dust.mesh);
            dustParticles.splice(i, 1);
            continue;
        }

        const positions = dust.positions;
        const velocities = dust.velocities;
        const speed = dust.speed;

        // Move particles outward from sun using individual velocities
        for (let j = 0; j < positions.length; j += 3) {
            positions[j] += velocities[j] * speed;
            positions[j + 1] += velocities[j + 1] * speed;
            positions[j + 2] += velocities[j + 2] * speed;
        }

        // Update geometry
        dust.mesh.geometry.attributes.position.needsUpdate = true;

        // Check if particles have reached target
        const distance = dust.origin.distanceTo(dust.target);
        const currentDistance = dust.origin.distanceTo(new THREE.Vector3(positions[0], positions[1], positions[2]));

        if (currentDistance > distance * 1.5) {
            dust.isActive = false;
        }
    }
}

// Update speed of all existing dust particles
export function updateDustSpeed(newSpeed) {
    for (let i = 0; i < dustParticles.length; i++) {
        dustParticles[i].speed = newSpeed;
    }
}

// Clear all dust particles
export function clearAllDust() {
    for (let i = dustParticles.length - 1; i >= 0; i--) {
        scene.remove(dustParticles[i].mesh);
    }
    dustParticles = [];
}
