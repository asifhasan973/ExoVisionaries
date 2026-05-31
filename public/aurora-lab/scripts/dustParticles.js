// dustParticles.js - Red dust particle system for solar wind
import { THREE, scene } from './scene-core.js';

export let dustParticles = [];

// Simple test function to create basic visible particles
export function createSimpleTestParticles(origin) {

    // First create a bright red sphere at the sun position to verify positioning
    const sphereGeometry = new THREE.SphereGeometry(5, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const testSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    testSphere.position.copy(origin);
    scene.add(testSphere);

    // Then create particles
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(50 * 3);

    for (let i = 0; i < 50; i++) {
        const i3 = i * 3;
        positions[i3] = origin.x + (Math.random() - 0.5) * 20;
        positions[i3 + 1] = origin.y + (Math.random() - 0.5) * 20;
        positions[i3 + 2] = origin.z + (Math.random() - 0.5) * 20;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0x00ff00, // Bright green for visibility
        size: 10.0, // Large size
        transparent: true,
        opacity: 1.0
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    return points;
}

// Create a simple moving particle test
export function createMovingParticleTest(origin, target) {

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(20 * 3);

    // Create particles in a line from origin to target
    for (let i = 0; i < 20; i++) {
        const i3 = i * 3;
        const t = i / 19; // 0 to 1
        positions[i3] = origin.x + (target.x - origin.x) * t;
        positions[i3 + 1] = origin.y + (target.y - origin.y) * t;
        positions[i3 + 2] = origin.z + (target.z - origin.z) * t;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0xffff00, // Bright yellow
        size: 15.0, // Very large
        transparent: true,
        opacity: 1.0
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    return points;
}

// Create a dust particle system
export function createDustParticles(origin, target, dustData = {}) {

    const particleCount = dustData.particleCount || 2000; // Very high density particles
    const particleGeometry = new THREE.BufferGeometry();

    // Create position, velocity, and size arrays
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const opacities = new Float32Array(particleCount);
    const lifetimes = new Float32Array(particleCount);

    // Calculate direction from sun to earth
    const direction = target.clone().sub(origin).normalize();

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Random position around the origin (sun)
        const spread = dustData.spread || 15;
        positions[i3] = origin.x + (Math.random() - 0.5) * spread;
        positions[i3 + 1] = origin.y + (Math.random() - 0.5) * spread;
        positions[i3 + 2] = origin.z + (Math.random() - 0.5) * spread;

        // Random velocity towards earth with some spread
        const baseSpeed = dustData.speed || 8.0; // Much faster
        const speedVariation = dustData.speedVariation || 2.0;
        const speed = baseSpeed + (Math.random() - 0.5) * speedVariation;

        // Add some randomness to direction
        const spreadAngle = dustData.spreadAngle || 0.3;
        const randomDir = direction.clone();
        randomDir.x += (Math.random() - 0.5) * spreadAngle;
        randomDir.y += (Math.random() - 0.5) * spreadAngle;
        randomDir.z += (Math.random() - 0.5) * spreadAngle;
        randomDir.normalize();

        velocities[i3] = randomDir.x * speed;
        velocities[i3 + 1] = randomDir.y * speed;
        velocities[i3 + 2] = randomDir.z * speed;

        // Random sizes (medium particles)
        sizes[i] = Math.random() * 1.5 + 0.8; // Medium-sized particles

        // Bright red colors with some variation
        const redIntensity = 1.0 + Math.random() * 0.3; // Brighter red
        colors[i3] = redIntensity; // Red
        colors[i3 + 1] = Math.random() * 0.2; // Very small green component
        colors[i3 + 2] = Math.random() * 0.1; // Very small blue component

        // Higher opacities for better visibility
        opacities[i] = Math.random() * 0.4 + 0.6; // More opaque

        // Random lifetimes
        lifetimes[i] = dustData.lifetime || 8.0 + Math.random() * 4.0;
    }

    // Set geometry attributes
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    particleGeometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

    // Create simple material for particles (more reliable)
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xff0000, // Bright red
        size: 2.0, // Large size
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);

    // Store dust data
    const dustInfo = {
        mesh: particleSystem,
        origin: origin.clone(),
        target: target.clone(),
        direction: direction,
        maxDistance: origin.distanceTo(target) + 200,
        startTime: Date.now() * 0.001,
        isActive: true,
        particleCount: particleCount,
        positions: positions,
        velocities: velocities,
        sizes: sizes,
        colors: colors,
        opacities: opacities,
        lifetimes: lifetimes
    };

    scene.add(particleSystem);
    dustParticles.push(dustInfo);

    return dustInfo;
}

// Update all dust particle systems
export function updateDustParticles() {
    const currentTime = Date.now() * 0.001;

    for (let i = dustParticles.length - 1; i >= 0; i--) {
        const dust = dustParticles[i];

        if (!dust.isActive) {
            scene.remove(dust.mesh);
            dustParticles.splice(i, 1);
            continue;
        }

        const elapsedTime = currentTime - dust.startTime;
        const positions = dust.positions;
        const velocities = dust.velocities;
        const opacities = dust.opacities;
        const lifetimes = dust.lifetimes;

        let activeParticles = 0;

        // Update each particle
        for (let j = 0; j < dust.particleCount; j++) {
            const j3 = j * 3;
            const particleLifetime = lifetimes[j];

            // Check if particle is still alive
            if (elapsedTime < particleLifetime) {
                activeParticles++;

                // Update position
                positions[j3] += velocities[j3] * 0.016; // 60fps
                positions[j3 + 1] += velocities[j3 + 1] * 0.016;
                positions[j3 + 2] += velocities[j3 + 2] * 0.016;

                // Add some random movement for more natural look
                positions[j3] += (Math.random() - 0.5) * 0.01;
                positions[j3 + 1] += (Math.random() - 0.5) * 0.01;
                positions[j3 + 2] += (Math.random() - 0.5) * 0.01;
            } else {
                // Particle is dead, reset it
                const spread = 15;
                positions[j3] = dust.origin.x + (Math.random() - 0.5) * spread;
                positions[j3 + 1] = dust.origin.y + (Math.random() - 0.5) * spread;
                positions[j3 + 2] = dust.origin.z + (Math.random() - 0.5) * spread;

                // Reset velocity
                const baseSpeed = 8.0; // Much faster
                const speed = baseSpeed + (Math.random() - 0.5) * 2.0;
                const spreadAngle = 0.3;
                const randomDir = dust.direction.clone();
                randomDir.x += (Math.random() - 0.5) * spreadAngle;
                randomDir.y += (Math.random() - 0.5) * spreadAngle;
                randomDir.z += (Math.random() - 0.5) * spreadAngle;
                randomDir.normalize();

                velocities[j3] = randomDir.x * speed;
                velocities[j3 + 1] = randomDir.y * speed;
                velocities[j3 + 2] = randomDir.z * speed;

                // Reset lifetime
                lifetimes[j] = 8.0 + Math.random() * 4.0;

                activeParticles++;
            }
        }

        // Update geometry attributes
        dust.mesh.geometry.attributes.position.needsUpdate = true;

        // Check if dust system should be removed (all particles dead for too long)
        if (activeParticles === 0 && elapsedTime > 15.0) {
            dust.isActive = false;
        }
    }
}
