const SimplexNoise = require('simplex-noise');
const THREE = require('three');

const simplex = new SimplexNoise();

function noise2D(x, y, settings)
{
  let z = 1.0;
  for (var i = 1; i <= settings.octaves; i++) {
    z *= (simplex.noise2D(x * settings.scale / i,
                          y * settings.scale / i)) * settings.amplitude;                               
  }

  return z;
}

/**
 * Tile that exhibits an underlying terrain geometry
 * Can be combined into a Terrain that generates infinitely with the player.
 */
export class TerrainTile extends THREE.BufferGeometry {

  constructor(settings, units = 1, origin = new THREE.Vector3())
  {
    super();
    this.terrainSettings = settings;

    // Generate a new terrain and assign it to buffer attributes

    const size = units * this.terrainSettings.unitSize;
    let positions = new Float32Array(size * size * 3);
    let normals = new Float32Array(size * size * 3);

    let indices = [];
    for (var yR = 0; yR < size; yR++) {
      for (var xR = 0; xR < size; xR++) {
        const index = (yR * size + xR) * 3;

        let pX = xR + origin.x;
        let pY = yR + origin.y;

        // Creat a small triangle about the elevation and get normal data from this
        let accuracy = 0.5;
        let tri = [new THREE.Vector3(pX, pY + accuracy),
                   new THREE.Vector3(pX - accuracy, pY - accuracy),
                   new THREE.Vector3(pX + accuracy, pY - accuracy)];
        
        tri.forEach( (triangle, index, tris) => {
          const elemZ = noise2D(triangle.x, triangle.y, this.terrainSettings);
          tri[index] = new THREE.Vector3(triangle.x, triangle.y, elemZ);
        });

        const position = (new THREE.Vector3(pX, pY, noise2D(pX, pY, this.terrainSettings))).add(origin);
        const normal = tri[1].sub(tri[0]).cross(tri[2].sub(tri[0])).normalize();

        positions[index+0] = position.x;
        positions[index+1] = position.z;
        positions[index+2] = position.y;

        normals[index+0] = normal.x;
        normals[index+1] = normal.z;
        normals[index+2] = normal.y;

        const nextRow = (yR + 1) * size + xR;

        if (xR < (size - 1) && yR < (size - 1)) {
          indices.push(index / 3, nextRow, nextRow + 1,
                       index / 3, nextRow + 1, index / 3 + 1);
        }                     
      }
    }

    console.log(positions);
    console.log(normals);
    console.log(indices);

    this.setIndex(indices);
    this.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    this.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3, true));
  }
}

export class Terrain 
{

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