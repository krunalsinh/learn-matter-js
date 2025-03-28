
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

Composite.add(world, [obstacles]);

function createDoll(x, y, scale) {

    const size = {
        head: {
            height: 50,
            width: 50,
        },
        chest: {
            height: 200,
            width: 150,
        },
        handLeg: {
            height: 35,
            width: 80
        },

    }
    const dollHead = Bodies.rectangle(
        x,
        y + size.head.height / 2,
        size.head.width,
        size.head.height,
        {
            label: 'head',
            isStatic: false,
            collisionFilter: {
                group: Body.nextGroup(true)
            },
            chamfer: {
                radius: [15 * 0.5, 15 * 0.5, 15 * 0.5, 15 * 0.5]
            },
            render: {
                fillStyle: '#FFBC42'
            }
        })

    const dollChest = Bodies.rectangle(
        x,
        y + size.chest.height / 2 + size.head.height,
        size.chest.width,
        size.chest.height,
        {
            label: 'chest',
            isStatic: false,
            collisionFilter: {
                group: Body.nextGroup(true)
            },
            chamfer: {
                radius: [30 * scale, 30 * scale, 30 * scale, 30 * scale]
            },
            render: {
                fillStyle: '#666'
            }
        })

    const hedChestConstraint = Constraint.create({
        bodyA: dollHead,
        pointA: {
            x: 0,
            y: size.head.height / 2
        },
        bodyB: dollChest,
        pointB: {
            x: 0,
            y: -size.chest.height / 2
        },
        stiffness: 0.6,
        render: {
            visible: false
        }
    })

    const leftUpperHand = Bodies.rectangle(
        x - size.handLeg.width / 2 - size.chest.width / 2,
        y - (size.handLeg.height / 2) + size.head.height + size.handLeg.height,
        size.handLeg.width,
        size.handLeg.height,
        {
            label: 'upperHand',
            isStatic: false,
            collisionFilter: {
                group: Body.nextGroup(true)
            },
            chamfer: {
                radius: [15 * scale, 15 * scale, 15 * scale, 15 * scale]
            },
            render: {
                fillStyle: 'blue'
            }
        })

    const leftUpperHandConstraint = Constraint.create({
        bodyA: leftUpperHand,
        pointA: {
            x: size.handLeg.width / 2,
            y: 0
        },
        bodyB: dollChest,
        pointB: {
            x: -size.chest.width / 2,
            y: -size.chest.height / 2 + size.handLeg.height / 2
        },
        stiffness: 0.6,
        render: {
            visible: false
        }
    })

    const leftLowerHand = Bodies.rectangle(
        x - size.chest.width / 2 - size.handLeg.width * 1.5,
        y - (size.handLeg.height / 2) + size.head.height + size.handLeg.height,
        size.handLeg.width,
        size.handLeg.height,
        {
            label: 'upperHand',
            isStatic: false,
            collisionFilter: {
                group: Body.nextGroup(true)
            },
            chamfer: {
                radius: [15 * scale, 15 * scale, 15 * scale, 15 * scale]
            },
            render: {
                fillStyle: 'yellow'
            }
        })

    const leftLowerHandConstraint = Constraint.create({
        bodyA: leftLowerHand,
        pointA: {
            x: size.handLeg.width / 2,
            y: 0
        },
        bodyB: leftUpperHand,
        pointB: {
            x: -size.handLeg.width / 2,
            y: 0
        },
        stiffness: 0.6,
        render: {
            visible: false
        }
    })


    const leftUpperLeg = Bodies.rectangle(
        x - size.handLeg.width / 2 - size.chest.width / 2,
        y + size.chest.height + size.head.height - size.handLeg.height / 2,
        size.handLeg.width,
        size.handLeg.height,
        {
            label: 'upperLeg',
            isStatic: false,
            collisionFilter: {
                group: Body.nextGroup(true)
            },
            chamfer: {
                radius: [15 * scale, 15 * scale, 15 * scale, 15 * scale]
            },
            render: {
                fillStyle: 'blue'
            }
        })

    const leftUpperLegConstraint = Constraint.create({
        bodyA: leftUpperLeg,
        pointA: {
            x: size.handLeg.width / 2,
            y: 0
        },
        bodyB: dollChest,
        pointB: {
            x: -size.chest.width / 2,
            y: size.chest.width / 2
        },
        stiffness: 0.6,
        render: {
            visible: false
        }
    })

    const leftLowerLeg = Bodies.rectangle(
        x - size.chest.width / 2 - size.handLeg.width * 1.5,
        y + size.chest.height + size.head.height - size.handLeg.height / 2,
        size.handLeg.width,
        size.handLeg.height,
        {
            label: 'upperLeg',
            isStatic: false,
            collisionFilter: {
                group: Body.nextGroup(true)
            },
            chamfer: {
                radius: [15 * scale, 15 * scale, 15 * scale, 15 * scale]
            },
            render: {
                fillStyle: 'yellow'
            }
        })

    const leftLowerLegConstraint = Constraint.create({
        bodyA: leftLowerLeg,
        pointA: {
            x: size.handLeg.width / 2,
            y: 0
        },
        bodyB: leftUpperLeg,
        pointB: {
            x: -size.handLeg.width / 2,
            y: 0
        },
        stiffness: 0.6,
        render: {
            visible: false
        }
    })

    //------------------------------------------------------------------


    const rightUpperHand = Bodies.rectangle(
        x + size.handLeg.width / 2 + size.chest.width / 2,
        y - (size.handLeg.height / 2) + size.head.height + size.handLeg.height,
        size.handLeg.width,
        size.handLeg.height,
        {
            label: 'upperHand',
            isStatic: false,
            collisionFilter: {
                group: Body.nextGroup(true)
            },
            chamfer: {
                radius: [15 * scale, 15 * scale, 15 * scale, 15 * scale]
            },
            render: {
                fillStyle: 'blue'
            }
        })

    const rightUpperHandConstraint = Constraint.create({
        bodyA: rightUpperHand,
        pointA: {
            x: -size.handLeg.width / 2,
            y: 0
        },
        bodyB: dollChest,
        pointB: {
            x: size.chest.width / 2,
            y: -size.chest.height / 2 + size.handLeg.height / 2
        },
        stiffness: 0.6,
        render: {
            visible: false
        }
    })

    const rightLowerHand = Bodies.rectangle(
        x + size.chest.width / 2 + size.handLeg.width * 1.5,
        y - (size.handLeg.height / 2) + size.head.height + size.handLeg.height,
        size.handLeg.width,
        size.handLeg.height,
        {
            label: 'upperHand',
            isStatic: false,
            collisionFilter: {
                group: Body.nextGroup(true)
            },
            chamfer: {
                radius: [15 * scale, 15 * scale, 15 * scale, 15 * scale]
            },
            render: {
                fillStyle: 'yellow'
            }
        })

    const rightLowerHandConstraint = Constraint.create({
        bodyA: rightLowerHand,
        pointA: {
            x: -size.handLeg.width / 2,
            y: 0
        },
        bodyB: rightUpperHand,
        pointB: {
            x: size.handLeg.width / 2,
            y: 0
        },
        stiffness: 0.6,
        render: {
            visible: false
        }
    })


    const rightUpperLeg = Bodies.rectangle(
        x + size.handLeg.width / 2 + size.chest.width / 2,
        y + size.chest.height + size.head.height - size.handLeg.height / 2,
        size.handLeg.width,
        size.handLeg.height,
        {
            label: 'upperLeg',
            isStatic: false,
            collisionFilter: {
                group: Body.nextGroup(true)
            },
            chamfer: {
                radius: [15 * scale, 15 * scale, 15 * scale, 15 * scale]
            },
            render: {
                fillStyle: 'blue'
            }
        })

    const rightUpperLegConstraint = Constraint.create({
        bodyA: rightUpperLeg,
        pointA: {
            x: -size.handLeg.width / 2,
            y: 0
        },
        bodyB: dollChest,
        pointB: {
            x: size.chest.width / 2,
            y: size.chest.width / 2
        },
        stiffness: 0.6,
        render: {
            visible: false
        }
    })

    const rightLowerLeg = Bodies.rectangle(
        x + size.chest.width / 2 + size.handLeg.width * 1.5,
        y + size.chest.height + size.head.height - size.handLeg.height / 2,
        size.handLeg.width,
        size.handLeg.height,
        {
            label: 'upperLeg',
            isStatic: false,
            collisionFilter: {
                group: Body.nextGroup(true)
            },
            chamfer: {
                radius: [15 * scale, 15 * scale, 15 * scale, 15 * scale]
            },
            render: {
                fillStyle: 'yellow'
            }
        })

    const rightLowerLegConstraint = Constraint.create({
        bodyA: rightLowerLeg,
        pointA: {
            x: -size.handLeg.width / 2,
            y: 0
        },
        bodyB: rightUpperLeg,
        pointB: {
            x: size.handLeg.width / 2,
            y: 0
        },
        stiffness: 0.6,
        render: {
            visible: false
        }
    })



    let person = Composite.create({
        bodies: [
            dollChest,
            dollHead,
            leftUpperHand,
            leftLowerHand,
            leftUpperLeg,
            leftLowerLeg,
            rightUpperHand,
            rightLowerHand,
            rightUpperLeg,
            rightLowerLeg
        ],
        constraints: [
            hedChestConstraint,
            leftUpperHandConstraint,
            leftLowerHandConstraint,
            leftUpperLegConstraint,
            leftLowerLegConstraint,
            rightUpperHandConstraint,
            rightLowerHandConstraint,
            rightUpperLegConstraint,
            rightLowerLegConstraint
        ]
    })

    return person;
}



const doll = createDoll(200, -300, 1);

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


var timeScaleTarget = 0,
        lastTime = Common.now();
Events.on(engine, 'afterUpdate', function (event) {
    if(engine.timing.timeScale < 0.1){
        engine.timing.timeScale = 1;
    }else{
        engine.timing.timeScale -= 0.005;
    }
    console.log(engine.timing.timeScale);
    

    // engine.timing.timeScale += (timeScaleTarget - engine.timing.timeScale) * 3 * timeScale;
    // if (Common.now() - lastTime >= 2000) {
    //     timeScaleTarget = 0.0005;
    //     lastTime = Common.now();
    // }else{
    //     timeScaleTarget += 0.001
    // }
 

    for (var i = 0; i < stack.bodies.length; i += 1) {
        var body = stack.bodies[i];

        Body.translate(body, {
            x: -30 * 0.01,
            y: -30 * 0.01
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

    for (var i = 0; i < obstacles.bodies.length; i += 1) {
        var body = obstacles.bodies[i], bounds = body.bounds;;

        if (bounds.min.y > render.bounds.max.y + 100) {
            Body.translate(body, {
                x: -bounds.min.x,
                y: -render.bounds.max.y - 300
            });
        }

    }

    for (i = 0; i < doll.bodies.length; i += 1) {
        var ragdoll = doll.bodies[i],
        bounds = ragdoll.bounds;
        
        // console.log(bounds);

        // move ragdolls back to the top of the screen
        if (bounds.min.y > render.bounds.max.y + 500) {
            Composite.translate(doll, {
                x:  -render.bounds.max.x / 1.5,
                y: -render.bounds.max.y - 500
            });
        }
    }

})



