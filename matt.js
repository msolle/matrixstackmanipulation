/* Matthew P. Solle

   */


var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

  // Vertex coordinates and color
  //221,207,153 - Pyramid RGB Colors
  var pR = 221/255;
  var pG = 207/255;
  var pB = 153/255;

  //ground Green Value
  var gG = 128/255;
  //255,128,0   - Ground Colo

var verticesColors = new Float32Array([

  50.0,150.0,250.0, 1.0, gG, 0.0, //ground
  150.0,150.0,350.0, 1.0, gG, 0.0,
  150.0,100.0,250.0, 1.0, gG, 0.0,
  350.0,150.0,350.0, 1.0, gG, 0.0,
  350.0,100.0,250.0, 1.0, gG, 0.0, 
  450.0,150.0,250.0, 1.0, gG, 0.0,
  450.0,150.0,250.0, 1.0, gG, 0.0,
  350.0,150.0,150.0, 1.0, gG, 0.0,
  350.0,100.0,250.0, 1.0, gG, 0.0,
  150.0,150.0,150.0, 1.0, gG, 0.0,
  150.0,100.0,250.0, 1.0, gG, 0.0,
  50.0,150.0,250.0, 1.0, gG, 0.0,  

  250.0,200.0, 250.0, pR, pG, pB,  //largest Pyramid
  225.0,150.0, 225.0, pR, pG, pB,
  225.0,150.0, 275.0, pR, pG, pB,
  275.0,150.0, 275.0, pR, pG, pB,
  275.0,150.0, 225.0, pR, pG, pB,
  225.0,150.0, 225.0, pR, pG, pB,

  310.0,180.0, 310.0, pR, pG, pB,  //Second Pyramid
  285.0,150.0, 285.0, pR, pG, pB,
  285.0,150.0, 335.0, pR, pG, pB,
  335.0,150.0, 335.0, pR, pG, pB,
  335.0,150.0, 285.0, pR, pG, pB,
  285.0,150.0, 285.0, pR, pG, pB,

]);

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders in render context
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  // Assign the buffer object to a_Color and enable the assignment
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.558, 0.637, 1, 1);

  //Enable depth test
  gl.enable(gl.DEPTH_TEST);

  // Get the storage location of u_ProjMatrix
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if(!u_ProjMatrix ) {
    console.log('Failed to get the storage location of u_ProjMatrix');
    return;
  }

  // Set the matrix to be used for to set the camera view
  var projMatrix = new Matrix4();
  
  // Specify the viewing volume
  projMatrix.setOrtho(0, 500, 0, 500, -500, 0);

  // Pass the view projection matrix 
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
  
  // Get the storage location of u_ModelMatrix
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix ) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Set the matrix to be used for to set the camera view
  var modelMatrix = new Matrix4();
  
  // Specify the viewing volume
  modelMatrix.setIdentity();

  // Pass the view model matrix 
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  
   var n = initVertexBuffers(gl, a_Position, a_Color);
   if (n < 0) {
     console.log('Failed to set the positions of the vertices');
     return;
   }
   // Current rotation angle
  var currentAngleUpDown = 0.0;

  // Start drawing
  var tick = function() {
    currentAngleUpDown = animate(currentAngleUpDown);  // Update the rotation angle
    draw(gl, currentAngleUpDown, yAxis, xAxis, u_ModelMatrix, modelMatrix);   // Draw the triangle
    requestAnimationFrame(tick, canvas);   // Request that the browser ?calls tick
  };
  tick();
//  draw(gl, u_ModelMatrix, modelMatrix);
 

}


/*initialize color and position buffers */
function initVertexBuffers(gl, a_Position, a_Color) {

  var n = verticesColors.length;
  // Create a buffer object
  var vertexColorBuffer = gl.createBuffer();  
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write vertex information to buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);
  
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}

/* draws scene */
function draw(gl, currentAngle, yAxis, xAxis, u_ModelMatrix, modelMatrix) {

  //specific viewing volume
  modelMatrix.setTranslate(250, 250, 250); //Take origin from bottom left corner and moving origin to the center of the image
  //rotate (degress, about x, about y, about z)
  modelMatrix.rotate(currentAngle, xAxis,yAxis, 1);          //Rotate sailboat about X 100degrees 
  modelMatrix.translate(-250, -250, -250); //Moves coordinate frame back down

  //Pass projection matrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Clear <canvas> and initialize depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);

  // Draw the boat
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6); //Ground
  gl.drawArrays(gl.TRIANGLE_STRIP,6, 6); //Ground
  gl.drawArrays(gl.TRIANGLE_FAN, 12, 6); //Largest Pyramid
  gl.drawArrays(gl.TRIANGLE_FAN, 18, 6); //Second Pyramid
}

//Rotation Degrees (degrees/second)
var ANGLE_STEP = 0;

var yAxis = 0;
var xAxis = 0;

// Last time that this function was called
var g_last = Date.now();
function animate(angle) {
  document.getElementById("xAxisRot").innerHTML = "X: " + xAxis;
  document.getElementById("yAxisRot").innerHTML = "Y: " + yAxis;
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}

function xAxisRotation() {
  if(xAxis == 1) {
      xAxis = 0;
  } else {
    xAxis = 1;
  }
}

function yAxisRotation() {
  if(yAxis == 1) {
    yAxis = 0;
  } else {
    yAxis = 1;
  }
}

function up() {
  ANGLE_STEP += 10; 
}

function down() {
  ANGLE_STEP -= 10; 
}