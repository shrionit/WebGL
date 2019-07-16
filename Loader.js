let mat4 = glMatrix.mat4;
let vec3 = glMatrix.vec3;

function loadToVBO(data){
	let b = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, b);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	return b;
}

function loadToIBO (indices) {
	let i = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, i);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
}

function loadTextures(url){
	const texture = gl.createTexture();
  	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Because images have to be download over the internet
	// they might take a moment until they are ready.
	// Until then put a single pixel in the texture so we can
	// use it immediately. When the image has finished downloading
	// we'll update the texture with the contents of the image.
	const level = 0;
	const internalFormat = gl.RGBA;
	const width = 1;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
	                width, height, border, srcFormat, srcType,
	                pixel);

	const image = new Image();
	image.onload = function() {
	    gl.bindTexture(gl.TEXTURE_2D, texture);
	    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
	                  srcFormat, srcType, image);

	    // WebGL1 has different requirements for power of 2 images
	    // vs non power of 2 images so check if the image is a
	    // power of 2 in both dimensions.
	    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
	       // Yes, it's a power of 2. Generate mips.
	       gl.generateMipmap(gl.TEXTURE_2D);
	    } else {
	       // No, it's not a power of 2. Turn off mips and set
	       // wrapping to clamp to edge
	       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	    }
	};
	image.src = url;

	return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function load(vertices, texture){
	let vbo = loadToVBO(vertices);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(0);
	let vbo0 = loadToVBO(texture);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo0);
	gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(1);
}

function loadMat4ToLocation(loc, mat4){
	gl.uniformMatrix4fv(loc, false, mat4)
}

function toRad(a){return a*Math.PI/180}