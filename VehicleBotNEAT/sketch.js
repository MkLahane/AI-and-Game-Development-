const SIGHT = 400;
const LIFESPAN = 70;
const TOTAL_VEHICLES = 500;
const MUTATION_RATE = 0.1;
let obstacles = [];
let vehicles = [];
let simulate = false;
let startPoint = null;
let addingCheckPoints = false;
let startPointR = 5;
let checkPoints = [];
let currentCheckPointStartX = null;
let currentCheckPointStartY = null;
let savedVehicles = [];
let buttonsList = ["Start", "CheckPoints", "Tracks", "Simulate"];
let buttonsMap = {};
let points = [];
let doneTrackingButton;
let doneTracking = false;
let slider; 
function setup() {
    createCanvas(1400, 900);
    tf.setBackend('cpu');
    createVehicles();
    doneTrackingButton = new Button("Done", width - 150, height - 100, 100, 50);
    for (let i = 0; i < buttonsList.length; i++) {
        let tempY = 150;
        let buttonName = buttonsList[i];
        buttonsMap[buttonName] = new Button(buttonName, width - 300, tempY + i * (50 + 30), 250, 50);
    }
    slider = createSlider(1, 10, 1);
}

function gameLogic() {
    if (simulate) {
        
        for (let i = vehicles.length - 1; i >= 0; i--) {
            vehicles[i].update();
            vehicles[i].checkProgress(checkPoints);
            vehicles[i].decide(obstacles);
            if (vehicles[i].dead) {
                savedVehicles.push(vehicles.splice(i, 1)[0]);
            }
        }
        if (vehicles.length <= 0) {
            nextGeneration();
        }
    }
} 

function draw() {
    background(0);
    for (let obstacle of obstacles) {
        obstacle.show();
    }
    if (doneTracking) {
        doneTrackingButton.show();
        doneTrackingButton.hover(mouseX, mouseY);
    }
    // stroke(0, 255, 0);
    // noFill();
    // strokeWeight(2);
    // beginShape();
    // for (let p of points) {
    //     vertex(p.x, p.y);
    // }
    // endShape();
    for (let buttonName of buttonsList) {
        buttonsMap[buttonName].show();
        if (!doneTracking) {
            buttonsMap[buttonName].hover(mouseX, mouseY);
        }
    }
    for (let vehicle of vehicles) {
            vehicle.show();
    }
    for (let n = 0; n < slider.value(); n++) {
      gameLogic();   
    } 
    if (startPoint != null) {
        noStroke();
        fill(255, 0, 0);
        ellipse(startPoint.x, startPoint.y, startPointR * 2);
    }
    //checkPoints render 
    for (let checkPoint of checkPoints) {
        strokeWeight(2);
        stroke(0, 0, 200);
        line(checkPoint.a.x, checkPoint.a.y, checkPoint.b.x, checkPoint.b.y);
    }
}
function mousePressed() {
    if (doneTracking) {
        doneTrackingButton.isPressed(mouseX, mouseY);
        if (doneTrackingButton.pressed) {
            doneTracking = false;
            let a = points[points.length - 1];
            let b = points[0];
            obstacles.push(new Boundary(a.x, a.y, b.x, b.y));
            buttonsMap["Tracks"].pressed = false;
            points = [];
            doneTrackingButton.pressed = false;
        } else if (mouseX < width - 300) {
            points.push(createVector(mouseX, mouseY));
            if (points.length > 1) {
                let a = points[points.length - 2];
                let b = points[points.length - 1];
                obstacles.push(new Boundary(a.x, a.y, b.x, b.y));
            }
        }
        return;
    }
    for (let buttonName of buttonsList) {
        buttonsMap[buttonName].isPressed(mouseX, mouseY);
        if (buttonsMap[buttonName].pressed) {
            for (let j = 0; j < buttonsList.length; j++) {
                let bName = buttonsList[j];
                if (bName == buttonName) {
                    continue;
                }
                buttonsMap[bName].pressed = false;
            }
        }
    }
    if (buttonsMap["Start"].pressed && mouseX < width - 300) {
        startPoint = createVector(mouseX, mouseY);
        for (let vehicle of vehicles) {
            vehicle.pos.set(startPoint.x, startPoint.y);
        }
        
    } else if (buttonsMap["CheckPoints"].pressed && mouseX < width - 300) {
        currentCheckPointStartX = mouseX;
        currentCheckPointStartY = mouseY;
    } else if (buttonsMap["Simulate"].pressed) {
        simulate = !simulate; 
        buttonsMap["Simulate"].pressed = false;
    } else if (buttonsMap["Tracks"].pressed) {
        //points.push(createVector(mouseX, mouseY));
        doneTracking = true;
        
    } 
}

function mouseReleased() {
    if (currentCheckPointStartX != null && currentCheckPointStartY != null) {
        checkPoints.push(new Boundary(currentCheckPointStartX, currentCheckPointStartY, mouseX, mouseY));
    }
    currentCheckPointStartX = null;
    currentCheckPointStartY = null;
}
// function mousePressed() {
//     // if (addingCheckPoints && !simulate) {
//     //     currentCheckPointStartX = mouseX;
//     //     currentCheckPointStartY = mouseY;
//     // }
// }
// function mouseReleased() {
//     if (addingCheckPoints && !simulate) {
//         checkPoints.push(new Boundary(currentCheckPointStartX, currentCheckPointStartY, mouseX, mouseY));
//     }
//     currentCheckPointStartX = null;
//     currentCheckPointStartY = null;
// }



// function mouseDragged() {
//     if (buttonsMap["Tracks"].pressed) {
//         obstacles.push(new Boundary(pmouseX, pmouseY, mouseX, mouseY));
//     } 
// }

function generate() {
    let a = null;
    let b = null;
    for (let i = 0; i < points.length; i++) {
        if (i == 0) {
            continue; 
        }
        a = points[i-1];
        b = points[i];
        if (obstacles.length == 0) {
            let ab = p5.Vector.sub(b, a);
            let d = ab.mag();
            ab.normalize();
            ab.mult(100);
            let abInnerPerp = createVector(ab.y, -ab.x);
            let innerA = p5.Vector.add(a, abInnerPerp);
            let innerB = p5.Vector.add(innerA, ab.copy().setMag(d));
            obstacles.push(new Boundary(innerA.x, innerA.y, innerB.x, innerB.y));
        } else {
            let innerA = obstacles[obstacles.length - 1].b;
            let ba = p5.Vector.sub(a, b);
            ba.normalize();
            ba.mult(100);
            let baInnerPerp = createVector(ba.y, -ba.x);
            let innerB = p5.Vector.add(b, baInnerPerp);
            obstacles.push(new Boundary(innerA.x, innerA.y, innerB.x, innerB.y));
        }
    }
}

function createVehicles() {
    for (let i = 0; i < TOTAL_VEHICLES; i++) {
        vehicles.push(new Vehicle());
    }
}

function keyPressed() {
    if (key == 'g') {
        generate();
    }
    // if (key == ' ') {
    //     simulate = !simulate;
        
    // } else if (key == 'v') {
    //     vehicle.vel = p5.Vector.random2D().mult(4);
    // } else if (key == 's') {
    //     startPoint = createVector(mouseX, mouseY);
    //     for (let vehicle of vehicles) {
    //         vehicle.pos.set(startPoint.x, startPoint.y);
    //     }
    // } else if (key == 'e') {
    //     endPoint = createVector(mouseX, mouseY);
    // } else if (key == 'c') {
    //     addingCheckPoints = !addingCheckPoints;
    // } else if (key == 'd') {
    //     obstacles = [];
    //     checkPoints = [];
    // } else if (key == 'p') {
    //     saveModel();
    // }
}


function saveModel() {
    saveJSON(vehicles[0].brain, "model.json");
}
