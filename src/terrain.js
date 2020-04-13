const SimplexNoise = require('simplex-noise');
const THREE = require('three');

export function generate(terrain, settings) {
    // Generate some noise for this plane
    for (var i = 0; i < settings.octaves; i++) {
        const simplex = new SimplexNoise();
        terrain.vertices.forEach(function (vertex) {
            if (i == 0) vertex.setZ(1);
            vertex.z *= (simplex.noise2D(vertex.x * settings.scale/(i+1), vertex.y * settings.scale/(i+1))) * settings.amplitude;
        });
    }

    terrain.computeVertexNormals();
    terrain.normalsNeedUpdate = true;
}

export function generateTrees(terrain, numTrees) {

    // Put a tree at this vertex randomly at a percent chance
    let tree = new THREE.BoxBufferGeometry(0.05, 0.3, 0.05);
    let leaves = new THREE.SphereBufferGeometry(0.2);

    let treeMat = new THREE.MeshStandardMaterial({ color: 0xA86522 });
    let leavesMat = new THREE.MeshStandardMaterial({ color: 0x019b10});

    let treeMesh = new THREE.Mesh(tree, treeMat);
    let leavesMesh = new THREE.Mesh(leaves, leavesMat);
    
    // Move the leaves up to the top of the tree
    leavesMesh.position.y = 0.3;
    treeMesh.position.y = 0.15;

    treeMesh.castShadow = true;
    leavesMesh.castShadow = true;
    treeMesh.recieveShadow = true;
    leavesMesh.recieveShadow = true;

    var treeFinal = new THREE.Object3D();
    treeFinal.add(treeMesh);
    treeFinal.add(leavesMesh);

    var raycaster = new THREE.Raycaster();

    for (var i = 0; i < numTrees; i++) {

        let currentTree = treeFinal.clone(true);

        let x = (Math.random() - 0.5) * 64;
        let z = (Math.random() - 0.5) * 64;
        let y = 0;

        raycaster.set(new THREE.Vector3(x, 50, z), new THREE.Vector3(0, -1, 0));
        let intersects = raycaster.intersectObjects([terrain]);

        if (intersects.length > 0) {
            y = intersects[0].point.y;
        }

        currentTree.position.set(x, y, z);

        terrain.add(currentTree);
    }
}