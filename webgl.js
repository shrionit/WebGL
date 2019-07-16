let canvas = document.createElement('canvas');
canvas.width = screen.availWidth;
canvas.height = screen.availHeight;
document.body.appendChild(canvas);

let gl = canvas.getContext('webgl');
if(!gl){console.log('webgl is not supported');}
/*-----------------------------------------------*/
/*---------------*****************---------------*/

let vertex_shader = document.getElementById('vS').textContent;

let fragment_shader = document.getElementById('fS').textContent;

/*---------------_________________---------------*/
/*-----------------------------------------------*/

/*-----------------------------------------------*/
/*---------------*****************---------------*/
//projection

let projectionMat = mat4.create();
//mat4.identity(projectionMat);
mat4.perspective(projectionMat, toRad(45), canvas.width/canvas.height, 0.1, 1e3);
//transformation
function transform (pos, rot, scl) {
	let modelMat = mat4.create();
	
	
	mat4.rotate(modelMat, modelMat, toRad(rot[0]), [1, 0, 0]);
	mat4.rotate(modelMat, modelMat, toRad(rot[1]), [0, 1, 0]);
	mat4.rotate(modelMat, modelMat, toRad(rot[2]), [0, 0, 1]);
	// mat4.fromScaling(modelMat, scl);
	mat4.translate(modelMat, modelMat, pos); 
	
	return modelMat;
}

//camera or view
function camera(pos, lookat){
	let viewMat = mat4.create();
	mat4.identity(viewMat);
	mat4.lookAt(viewMat, pos, lookat, [0.0, 1.0, 0.0]);
	return viewMat;
}

/*---------------_________________---------------*/
/*-----------------------------------------------*/

function genPoints(n){
	let vert = [];
	let rang = [];
	let c = 0;
	for (let i = 0; i < n; i++) {
		let v = [];
		let x = Math.cos(i);
		let z = Math.sin(i);
		for(let a=0;a<360;a++){
			let X = x+Math.cos(a*Math.PI/180);
			let Y = z+Math.sin(a*Math.PI/180);
			v = [X, Y, z];
		//vec3.normalize(v, v);
			vert.push(...v);
		}
		
		rang.push(...[Math.random(), c]);
	}
	return {v: vert, c: rang};
}

let points = genPoints(30000);
let vertices = points.v;

const cube = [
	// Front face
  -1.0, -1.0,  1.0,
   1.0, -1.0,  1.0,
   1.0,  1.0,  1.0,
  -1.0,  1.0,  1.0,
  
  // Back face
  -1.0, -1.0, -1.0,
  -1.0,  1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0, -1.0, -1.0,
  
  // Top face
  -1.0,  1.0, -1.0,
  -1.0,  1.0,  1.0,
   1.0,  1.0,  1.0,
   1.0,  1.0, -1.0,
  
  // Bottom face
  -1.0, -1.0, -1.0,
   1.0, -1.0, -1.0,
   1.0, -1.0,  1.0,
  -1.0, -1.0,  1.0,
  
  // Right face
   1.0, -1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0,  1.0,  1.0,
   1.0, -1.0,  1.0,
  
  // Left face
  -1.0, -1.0, -1.0,
  -1.0, -1.0,  1.0,
  -1.0,  1.0,  1.0,
  -1.0,  1.0, -1.0,
];


const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];

function makeTexCord(n){
	let f = [];
	for(let i=0;i<n/4;i++){
		let l = [
			0.0, 0.0,
			1.0, 1.0,
			1.0, 0.0,
			0.0, 1.0
		];
		f.push(...l);
	}
	return f;
}

const texC = makeTexCord(vertices.length);

let colors = points.c;

let UniformLoc = {};

function loadShader (vertShader, fragShader) {
	let vS = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vS, vertShader);
	gl.compileShader(vS);
	if(!vS){
		console.log(vS);
	}
	let fS = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fS, fragShader);
	gl.compileShader(fS);
	if(!fS){
		console.log(fS);
	}
	let shader = gl.createProgram();
	gl.attachShader(shader, vS);
	gl.attachShader(shader, fS);
	gl.linkProgram(shader);
	if(!shader){
		console.log(shader);
	}
	return shader;
}

function setup () {
	gl.viewport(0, 0, canvas.width, canvas.height);
	let shader = loadShader(vertex_shader, fragment_shader);
	gl.useProgram(shader);
	const tex = loadTextures('tex1.png');
	UniformLoc.uSampler = gl.getUniformLocation(shader, 'uSampler');
	UniformLoc.modelMat = gl.getUniformLocation(shader, 'model');
	UniformLoc.viewMat = gl.getUniformLocation(shader, 'view');
	UniformLoc.projectionMat = gl.getUniformLocation(shader, 'projection');
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.uniform1i(UniformLoc.uSampler, 0);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	loadMat4ToLocation(UniformLoc.projectionMat, projectionMat);
	load(vertices, texC);
	loadToIBO(indices);
}
let a = 0;
function update () {
	gl.clearColor(0.1, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
	loadMat4ToLocation(UniformLoc.modelMat, transform([0.0, 0.5, 0.0], [0.0, a*0.6, 0.0], [1.0, 1.0, 1.0]));
	loadMat4ToLocation(UniformLoc.viewMat, camera([0.0, 0.0, -5.0], [0.0, 0.0, 0.0]));
	a++;
}

function render(){
	requestAnimationFrame(render);
	update();
	gl.drawArrays(gl.LINES, 0, vertices.length/3);
	//gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function start(){
	setup();
	render();
}
start();
