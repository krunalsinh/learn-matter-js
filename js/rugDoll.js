
const canvas = document.getElementById('canvas');


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
    Events = Matter.Events,
    World = Matter.World;

// provide concave decomposition support library
Common.setDecomp(decomp);

// create an engine
const engine = Engine.create();

//world
const world = engine.world;

// create a renderer
const render = Render.create({
    element: document.body,
    canvas: canvas,
    engine: engine,
    options: {
        width: innerWidth,
        height: innerHeight,
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

var stairCount = (render.bounds.max.y - render.bounds.min.y) / 50;

var stack = Composites.stack(0, 0, stairCount + 2, 1, 0, 0, function (x, y, column) {
    // console.log(y + column * 50);

    return Bodies.rectangle(x - 50, y + column * 50, 100, 1000, {
        isStatic: true,
        render: {
            fillStyle: '#060a19',
            strokeStyle: '#ffffff',
            lineWidth: 1
        }
    });
});

Composite.add(world, [stack]);


var obstacles = Composites.stack(300, 0, 15, 3, 10, 10, function (x, y, column) {
    const sides = Math.round(Common.random(1, 8));
    const options = {
        render: {
            fillStyle: Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1'])
        }
    };
    const num = Math.random();
    if (0.33 <= num) {
        if (Common.random() < 0.8) {
            return Bodies.rectangle(x, y, Common.random(25, 50), Common.random(25, 50), options);
        } else {
            return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(25, 30), options);
        }
    }
    else if (0.66 <= num) {
        return Bodies.polygon(x, y, sides, Common.random(25, 50), options);
    } else {
        return Bodies.circle(x, y, Common.random(20, 40), options);
    }

});

// Composite.add(world, [obstacles]);

// function createDoll(x, y, scale) {

//     const size = {
//         head: {
//             height: 50,
//             width: 50,
//         },
//         chest: {
//             height: 200,
//             width: 150,
//         },
//         handLegUpper: {
//             height: 25,
//             width: 100
//         },
//         handLegLower: {
//             height: 25,
//             width: 100
//         }
//     }
//     const collisionFilter = Body.nextGroup(true);
//     const dollHead = Bodies.rectangle(
//         x,
//         y,
//         size.head.width,
//         size.head.height,
//         {
//             label: 'head',
//             collisionFilter: {
//                 group: collisionFilter
//             },
//             chamfer: {
//                 radius: [15 * 0.5, 15 * 0.5, 15 * 0.5, 15 * 0.5]
//             },
//             render: {
//                 fillStyle: '#FFBC42'
//             }
//         })

//     const dollChest = Bodies.rectangle(
//         x - size.head.width,
//         y + size.head.height,
//         size.chest.width,
//         size.chest.height,
//         {
//             label: 'chest',
//             collisionFilter: {
//                 group: collisionFilter
//             },
//             chamfer: {
//                 radius: [15 * scale, 15 * scale, 15 * scale, 15 * scale]
//             },
//             render: {
//                 fillStyle: '#FFBC42'
//             }
//         })

//     const hedChestConstraint = Constraint.create({
//         bodyA: dollHead,
//         pointA: {
//             x: dollHead.position.x + size.head.width / 2,
//             y: dollHead.position.y + size.head.height
//         },
//         bodyB: dollChest,
//         pointB: {
//             x: dollChest.position.x + size.chest.width / 2,
//             y: dollHead.position.y + size.head.height
//         },
//         stiffness: 0.6,
//         render: {
//             visible: false
//         }
//     })

//     return Composite.create({
//         label: "dollWrapper",
//         bodies: [
//             dollHead, dollChest
//         ],
//         constraints: [
//             hedChestConstraint
//         ]
//     })
// }

function createDoll(x, y, scale) {
    var head = Bodies.rectangle(x, y - 60 * scale, 34 * scale, 40 * scale, {
        label: 'head',
        collisionFilter: {
            group: Body.nextGroup(true)
        },
        chamfer: {
            radius: [15 * scale, 15 * scale, 15 * scale, 15 * scale]
        },
        render: {
            fillStyle: '#FFBC42'
        }
    });

    var chest = Bodies.rectangle(x, y, 55 * scale, 80 * scale, {
        label: 'chest',
        collisionFilter: {
            group: Body.nextGroup(true)
        },
        chamfer: {
            radius: [20 * scale, 20 * scale, 26 * scale, 26 * scale]
        },
        render: {
            fillStyle: '#E0A423'
        }
    });

    var headContraint = Constraint.create({
        bodyA: head,
        pointA: {
            x: 0,
            y: 25 * scale
        },
        pointB: {
            x: 0,
            y: -35 * scale
        },
        bodyB: chest,
        stiffness: 0.6,
        render: {
            visible: false
        }
    });

    var person = Composite.create({
        bodies: [
            chest, head
        ],
        constraints: [
            headContraint
        ]
    });

    return person;
}

const doll = createDoll(800, 200, 1);

Composite.add(world, doll);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);

// add mouse control
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
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

};

// add window resize handler
window.addEventListener('resize', handleWindowResize);

// update canvas size to initial window size
setTimeout(handleWindowResize, 1000);

Events.on(engine, 'afterUpdate', function (event) {
    var timeScale = (event.delta || (1000 / 60)) / 1000;
    // console.log(render.bounds.max.y);

    for (var i = 0; i < stack.bodies.length; i += 1) {
        var body = stack.bodies[i];

        Body.translate(body, {
            x: -30 * timeScale,
            y: -30 * timeScale
        });

        if (body.position.x < -50) {

            Body.setPosition(body, {
                x: 50 * (stack.bodies.length - 1),
                y: 25 + render.bounds.max.y + (body.bounds.max.y - body.bounds.min.y) * 0.5
            })

            Body.setVelocity(body, {
                x: 0,
                y: 0
            });
        }
    }

    // for (var i = 0; i < obstacles.bodies.length; i += 1) {
    //     var body = obstacles.bodies[i], bounds = body.bounds;;

    //     if (bounds.min.y > render.bounds.max.y + 100) {
    //         Body.translate(body, {
    //             x: -bounds.min.x,
    //             y: -render.bounds.max.y - 300
    //         });
    //     }

    // }

})



