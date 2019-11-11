let k = 3;
let c = "#000000";
let dots = [];
let radio = 20;
let startLoop = false;
let screenHeigh = document.querySelector(".buttons");

let clustersMeans = [];
let clusterRadio = 30;
let clusterK = [];

let kClusters = document.querySelector("#clusters");
kClusters.addEventListener("change", function () {
  k = (this.value);
});

function setup() {
  createCanvas(windowWidth, windowHeight - screenHeigh.offsetHeight);
  clearClusterK();
}

function clearClusterK() {
  clusterK = [];
  for (let i = 0; i < k; i++) {
    clusterK[i] = [];
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - screenHeigh.offsetHeight);
}

function suprise() {
  c = "#000000";
}

function circleSize() {
  radio = parseInt(document.getElementById("dotSize").value);
}

function draw() {
  background(220);
  dots.forEach(i => i.draw());
  clustersMeans.forEach(i => i.draw());
}

class dot {
  constructor(x, y, r, c) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.c = c;
    this.cluster = 0;
  }

  draw() {
    fill(color(this.c));
    circle(this.x, this.y, this.r);
  }

}

function mouseClicked() {
  if (mouseY > 0 && mouseX > 0) {
    dots.push(new dot(mouseX, mouseY, radio, c));
  }
}


function calculateKnn(fromCluster, p2, reCalculate) {
  let kn = [];
  fromCluster.forEach(p1 => {
    kn.push([dist(p1.x, p1.y, p2.x, p2.y), p1.c]);
  });
  kn.sort((a, b) => (a[0] > b[0]) ? 1 : -1);
  p2.c = kn[0][1];
  fromCluster.forEach(function (i, j) {
    if (i.c == p2.c) {
      if (!reCalculate) {
        p2.cluster = j;
        clusterK[j].push(p2);
      }
    }
  });
  // kn[0] shows distance kn[1] color 
}

// calculate KNN
function next(centerO) {
  clearClusterK();
  dots.forEach(i => {
    calculateKnn(centerO, i, false);
  });
}
//Calculate CenterOfClusters
function next2() {
  clusterK.forEach(i => {
    centerOfCluster(i);
  });
}
//Re-calculate Knn with center in CenterOfCluster
function next3() {
  dots.forEach(i => {
    calculateKnn(clustersMeans, i, true);
  });
}

let meansK = [];
let iterations = 0;
let meanIndex = 0;

function start(kk) {
  clustersMeans = [];
  let means = [];
  meansK = [];
  for (let i = 0; i < kk; i++) {
    meanIndex = Math.floor(Math.random() * dots.length);
    let mean = initializeMeans(means, meanIndex);
    if (iterations >= 0) {
      dots[mean].c = `#${(parseInt(Math.random() * 16777215)).toString(16)}`;
    }
    means.push(mean);
  }
  means.forEach(i => {
    meansK.push(dots[i]);
  });
  iterations++;
}

// To dont use the same mean
function initializeMeans(means, mean) {
  let cont = 0;
  means.forEach(i => {
    if (i != mean) cont++;
  });
  if (cont == means.length) {
    return mean
  } else {
    return initializeMeans(means, Math.floor(Math.random() * dots.length))
  }
}

function centerOfCluster(cluster) {
  let centerX = 0;
  let centerY = 0;
  cluster.forEach(i => {
    centerY += i.y;
    centerX += i.x;
  });
  centerY = centerY / cluster.length;
  centerX = centerX / cluster.length;
  let clusterColor = cluster[0].c || "#00FF00";
  clustersMeans.push(new clusterMean(centerX, centerY, clusterRadio, clusterColor));
}

class clusterMean {
  constructor(x, y, r, c) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.c = c;
  }
  draw() {
    fill(this.c);
    circle(this.x, this.y, this.r);
  }
}

function deleteAll() {
  dots = [];
  clustersMeans = [];
  clusterK = [];
  iterations = [];
}

function allIn() {
  play();
}

function randomDots(n) {
  for (let i = 0; i < n; i++) {
    dots.push(new dot(random(5, windowWidth), random(5, windowHeight), radio, c));
  }
}

let tempCluster = [];
let optimumCenter = false;
function play() {
  if (iterations == 0) {
    start(k);
    next(meansK);
  } else if(step==0){
    // if (JSON.stringify(tempCluster) == JSON.stringify(clustersMeans)) {
    //   optimumCenter = true;
    // }
    tempCluster = clustersMeans;
    clustersMeans = [];
    next(tempCluster);
  }
  next2();
  next3();
  step=0;
}

let step = 0;
function playNext() {
  if (iterations == 0 && step == 0) {
    start(k);
    next(meansK);
  } else if (step == 0) {
    let tempCluster = clustersMeans;
    clustersMeans = [];
    next(tempCluster);
  }
  if (step == 1) {
    next2();
  }
  if (step == 2) {
    next3();
  }
  step++;
  if (step >= 3) {
    step = 0;
  }
}

let clusterColorsUsed = [];
function kMeansPlusPlus() {
  start(1);
  clusterColorsUsed.push(meansK[0].c);
  next(meansK);
  for (let i = 1; i < k; i++) {
    farthestCluster();
  }
  step++;
  iterations++;
  console.log(clusterK);
}

function farthestCluster() {

  let maxDistance = 0;
  clusterK.forEach(i => {
    i.forEach(j => {
      let actualDistance = dist(meansK[0].x, meansK[0].y, j.x, j.y);
      if (actualDistance > maxDistance) {
        maxDistance = actualDistance;
      }
    });
  });

  let secondClusterIndex = 0;
  let secondcluster = false;

  secondClusterIndex = selectNewCluster(maxDistance);
  console.log(secondClusterIndex)
  clusterColorsUsed.push(dots[secondClusterIndex].c);
  dots[secondClusterIndex].c = `#${(parseInt(random(0, 16777215))).toString(16)}`;
  meansK.push(dots[secondClusterIndex]);
  next(meansK);
}

function selectNewCluster(maxDistance){
  clusterK.forEach(i => {
    i.forEach((j,l) => {
      let actualDistance = dist(meansK[0].x, meansK[0].y, j.x, j.y);
      if ( Math.random() < (actualDistance / maxDistance)) { 
          secondClusterIndex = l;
          secondcluster = true;
      }
    });
  });
  return secondClusterIndex
}

function elbowMethod() {

}

function toEnd() {
  while (!optimumCenter) {
    play();
  }
  optimumCenter = false;
}