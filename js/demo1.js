import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
let scene, camera, ambientLight, spotLighttop, spotLightbottom, renderer, control, mesh, gltf;
let canvas = document.querySelector('#c');
/*
综上所述
想要创建一个场景需要
1.场景
2.相机 控制器
3.灯光
4.渲染器
需要一个平面才能让点光源照射到实际的物体上
*/
window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / this.window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, this.window.innerHeight);
})
initScene()
initCamera()
initLight()
initRenderer()
initControls()
loadGltf()
animate()
renderer.domElement.ondblclick = onMouseClick;

function initScene() {
  scene = new THREE.Scene();
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(50, 0, 0);
  camera.lookAt(0, 0, 0);
}

function initLight() {
  ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  spotLighttop = new THREE.SpotLight(0xffffff, 0.8);
  spotLightbottom = new THREE.SpotLight(0xffffff, 0.4);
  spotLighttop.position.set(0, 200, 0);
  spotLightbottom.position.set(0, -200, 0);
  scene.add(ambientLight, spotLightbottom, spotLighttop);
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffff00, 0.1)
  document.body.appendChild(renderer.domElement); //canvas 画布 渲染完后插入一个dom节点在浏览器上显示
  renderer.render(scene, camera);
}

function initControls() {
  control = new OrbitControls(camera, renderer.domElement)
  control.maxDistance = 50

}

function loadGltf() {
  //创建stl模型加载器对象
  var loader = new GLTFLoader();
  loader.load("../gltf/abc/WE&EDM.gltf", obj => {
    console.log('123',obj.scene)
    gltf = obj.scene
    // 三维模型建立坐标、缩放、旋转
    gltf.position.set(0, 0, 0);
    gltf.rotation.set(0, 0, 0);
    gltf.scale.set(100, 100, 100);

    // obj.scene.traverse(obj => {
    //   if (obj.isMesh) {
    //     obj.material = new THREE.MeshPhysicalMaterial
    //       ({
    //         color: obj.material.color,
    //         roughness: 0.8
    //       })
    //   }
    // })
    // obj.scene.children[0].children.forEach(child => {
    //   sprites.push({
    //     mesh: child,
    //     sprite: null,
    //     texture: null,
    //     spriteMaterial: null
    //   })
    // })
    scene.add(gltf);
  });
}

function animate() {
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

function onMouseClick(event) {

  let intersects = getIntersects(event);

  if (intersects.length !== 0 && intersects[0].object.type === 'Mesh' && intersects[0].object.geometry.type === 'BufferGeometry') {
    mesh = intersects[0].object
    gltf.traverse(obj => {
      if (obj.isMesh) {
        obj.material = new THREE.MeshPhysicalMaterial({
          color: obj.material.color,
          roughness: 0.8,
          opacity: 0.2,
          transparent: true
        })
      }
    })
    mesh.material = new THREE.MeshPhysicalMaterial({
      color: mesh.material.color,
      roughness: 0.8
    })
  }
  else {
    // gltf.traverse(obj => {
    //   if (obj.isMesh) {
    //     obj.frustumCulled = false;
    //     obj.castShadow = true;
    //     console.log(obj.material)
    //     obj.material = new THREE.MeshPhongMaterial({
    //       color: obj.material.color,
    //       shininess: 100,
    //       reflectivity: 0.7
    //     })
    //   }
    // })
    console.log('未选中 Mesh!');
  }
}

function getIntersects(event) {

  event.preventDefault();// 阻止默认的点击事件执行,   

  //声明 rayCaster 和 mouse 变量
  let rayCaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2();

  //通过鼠标点击位置，计算出raycaster所需点的位置，以屏幕为中心点，范围-1到1
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  //这里为什么是-号，没有就无法点中
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  //通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
  rayCaster.setFromCamera(mouse, camera);

  //获取与射线相交的对象数组， 其中的元素按照距离排序，越近的越靠前。
  //+true，是对其后代进行查找，这个在这里必须加，因为模型是由很多部分组成的，后代非常多。
  let intersects = rayCaster.intersectObjects(scene.children, true);

  //返回选中的对象
  return intersects;
}