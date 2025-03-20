// const decomp = require("poly-decomp");

const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint,
    Common = Matter.Common,
    Mouse = Matter.Mouse,
    Vector = Matter.Vector,
    Vertices = Matter.Vertices,
    Svg = Matter.Svg,
    Events = Matter.Events;


// create an engine
var engine = Engine.create();

//world
var world = engine.world;

// create a renderer
var render = Render.create({
    element: document.body,
    canvas: canvas,
    engine: engine,
    options: {
        width: 800,
        height: 600,
        background: "#111",
        pixelRatio: window.devicePixelRatio,
        wireframes: false,
        showVelocity: false,
        showCollisions: false,
        showAngleIndicator: false,
        showBounds: false,
        showDebug: false,
        showSleeping: false,
        showAxes: false,
        // hasBounds: Renders only objects within a specific boundary.
        // enabled: Toggles rendering on/off.
        wireframeBackground: "#000",
        lineWidth: 1
    },
});


Composite.add(world, [
    Bodies.rectangle(200, 150, 700, 20, { isStatic: true, angle: Math.PI * 0.06, render: { fillStyle: '#eee' } }),
    Bodies.rectangle(500, 350, 700, 20, { isStatic: true, angle: -Math.PI * 0.06, render: { fillStyle: '#eee' } }),
    Bodies.rectangle(340, 580, 700, 20, { isStatic: true, angle: Math.PI * 0.04, render: { fillStyle: '#eee' } })
]);



// Custom `requestAnimationFrame` loop
let lastTime = performance.now();  
let counter = 0;
function customLoop(currentTime = 0) {
    
    // Custom rendering or effects here
    const context = render.context;
    // Clear the canvas before drawing
    context.clearRect(0, 0, render.canvas.width, render.canvas.height);

    const deltaTime = (currentTime - lastTime); 
    lastTime = currentTime;

    // console.log(counter);
    if(counter > 300){
        let color = Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1']);
        const circle1 = Matter.Bodies.circle(60, 0, Math.random() * 20 + 3, {
            isStatic: false,
            angle: Math.PI / 4,
            density: 1,
            friction: 0.5,
            restitution: 0.8,
            render: {
                fillStyle: color,
                strokeStyle: '#fff',
                lineWidth: 3
            },
            chamfer: {
                radius: 5
            },
            label: "box1"
        }, [1])
        Composite.add(world, circle1);
        counter = 0;
    }else{
        counter += deltaTime;
    }
    
    // Update the Matter engine
    Engine.update(engine);
  
    // Draw the Matter.js world
    Render.world(render);
  
    // Example: Custom animation effect (changing box color)
    // box.render.fillStyle = `hsl(${(performance.now() / 10) % 360}, 100%, 50%)`;
  
    // Call the next frame
    requestAnimationFrame(customLoop);
  }
  
  // Start the loop
  customLoop();





// add mouse control
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

Composite.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

// resize event handler
var handleWindowResize = function () {
    // get the current window size
    var width = window.innerWidth,
        height = window.innerHeight;

    // set the render size to equal window size
    Render.setSize(render, width, height);

    // update the render bounds to fit the scene
    Render.lookAt(render, Composite.allBodies(engine.world), {
        x: 50,
        y: 50
    });
};

// add window resize handler
window.addEventListener('resize', handleWindowResize);

// update canvas size to initial window size
handleWindowResize();

