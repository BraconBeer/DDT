// dice3d.js - 3D кубик d20 для DDT

import * as THREE from 'three';

let scene, camera, renderer, diceMesh;
let isRolling = false;
let rollTimeout;

// Цвета
const DICE_COLOR = 0xffaa33;      // Золотисто-жёлтый
const TEXT_COLOR = 0xcc3333;      // Красный
const EDGE_COLOR = 0xcc8800;      // Тёмно-золотой для рёбер

function initDice() {
    const container = document.getElementById('dice3d-container');
    if (!container) return;
    
    // Получаем размеры контейнера
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Сцена
    scene = new THREE.Scene();
    scene.background = null; // Прозрачный фон
    
    // Камера
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3);
    
    // Рендерер с прозрачностью
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Прозрачный
    container.appendChild(renderer.domElement);
    renderer.domElement.classList.add('dice-canvas');
    
    // Освещение
    // Основной свет
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);
    
    // Направленный свет сверху
    const topLight = new THREE.DirectionalLight(0xffffff, 1);
    topLight.position.set(0, 5, 3);
    scene.add(topLight);
    
    // Заполняющий свет снизу
    const fillLight = new THREE.DirectionalLight(0xffaa66, 0.5);
    fillLight.position.set(0, -3, 2);
    scene.add(fillLight);
    
    // Подсветка сзади
    const backLight = new THREE.PointLight(0x88aaff, 0.3);
    backLight.position.set(0, 1, -2);
    scene.add(backLight);
    
    // Создаём икосаэдр (20 граней)
    const geometry = new THREE.IcosahedronGeometry(0.9, 0);
    
    // Материал для граней
    const material = new THREE.MeshStandardMaterial({
        color: DICE_COLOR,
        roughness: 0.3,
        metalness: 0.7,
        emissive: 0x221100,
        emissiveIntensity: 0.1,
        flatShading: false
    });
    
    diceMesh = new THREE.Mesh(geometry, material);
    diceMesh.castShadow = true;
    diceMesh.receiveShadow = false;
    scene.add(diceMesh);
    
    // Добавляем числа на грани (простая версия - наклейки)
    addNumbersToFaces(diceMesh);
    
    // Добавляем золотистую обводку
    const edgesGeo = new THREE.EdgesGeometry(geometry);
    const edgesMat = new THREE.LineBasicMaterial({ color: EDGE_COLOR });
    const wireframe = new THREE.LineSegments(edgesGeo, edgesMat);
    diceMesh.add(wireframe);
    
    // Анимация
    function animate() {
        requestAnimationFrame(animate);
        if (!isRolling) {
            // Медленное вращение в покое
            diceMesh.rotation.y += 0.003;
            diceMesh.rotation.x += 0.002;
            diceMesh.rotation.z += 0.001;
        }
        renderer.render(scene, camera);
    }
    animate();
    
    // Обработчик ресайза
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        renderer.setSize(newWidth, newHeight);
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
    });
}
// ========== АВТОМАТИЧЕСКОЕ ОПРЕДЕЛЕНИЕ ЦЕНТРОВ ГРАНЕЙ ==========
function addNumbersToFaces(mesh) {
    // Получаем геометрию икосаэдра
    const geometry = mesh.geometry;
    
    // Извлекаем все треугольные грани (у икосаэдра 20 граней по 3 вершины)
    const positionAttribute = geometry.attributes.position;
    const index = geometry.index;
    
    if (!index) {
        console.error('Нет индексов у геометрии');
        return;
    }
    
    // Группируем вершины по граням (по 3 индекса на грань)
    const faceCenters = [];
    const faceVertices = [];
    
    for (let i = 0; i < index.count; i += 3) {
        const i1 = index.getX(i);
        const i2 = index.getX(i + 1);
        const i3 = index.getX(i + 2);
        
        const v1 = new THREE.Vector3(
            positionAttribute.getX(i1),
            positionAttribute.getY(i1),
            positionAttribute.getZ(i1)
        );
        const v2 = new THREE.Vector3(
            positionAttribute.getX(i2),
            positionAttribute.getY(i2),
            positionAttribute.getZ(i2)
        );
        const v3 = new THREE.Vector3(
            positionAttribute.getX(i3),
            positionAttribute.getY(i3),
            positionAttribute.getZ(i3)
        );
        
        // Центр грани = среднее арифметическое вершин
        const center = new THREE.Vector3(
            (v1.x + v2.x + v3.x) / 3,
            (v1.y + v2.y + v3.y) / 3,
            (v1.z + v2.z + v3.z) / 3
        ).normalize();
        
        faceCenters.push(center);
        faceVertices.push([v1, v2, v3]);
    }
    
    // Правильные числа для d20 (стандартная раскладка)
    // Порядок соответствует порядку граней в геометрии THREE.IcosahedronGeometry
    const numbers = [20, 1, 14, 8, 2, 5, 13, 11, 3, 7, 9, 16, 19, 6, 10, 15, 17, 4, 12, 18];
    
    // Сортируем грани по Y координате для красивого отображения (опционально)
    // Но лучше просто добавить на все грани
    
    faceCenters.forEach((center, idx) => {
        const num = numbers[idx % numbers.length];
        
        // Создаём canvas с числом
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Прозрачный фон
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Красный круг
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, canvas.width*0.32, 0, 2 * Math.PI);
        ctx.fillStyle = '#cc3333';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 10;
        ctx.stroke();
        
        // Белое число
        ctx.fillStyle = '#ffffff';
        ctx.font = `Bold ${canvas.width * 0.42}px "Arial"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(num.toString(), canvas.width/2, canvas.height/2);
        
        const texture = new THREE.CanvasTexture(canvas);
        
        const stickerMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true
        });
        
        const sticker = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.68), stickerMaterial);
        
        // Позиционируем на центре грани, немного выступая наружу
        sticker.position.copy(center.clone().multiplyScalar(0.94));
        
        // Поворачиваем наклейку наружу
        sticker.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            center
        );
        
        mesh.add(sticker);
    });
    
    console.log('Добавлено наклеек:', faceCenters.length);
}
// Бросок кубика
function rollDice() {
    if (isRolling) return;
    isRolling = true;
    
    // Случайные начальные углы
    const startRotX = diceMesh.rotation.x;
    const startRotY = diceMesh.rotation.y;
    const startRotZ = diceMesh.rotation.z;
    
    // Случайное количество оборотов (2-5 полных)
    const spinX = (Math.random() * 4 + 2) * Math.PI * 2;
    const spinY = (Math.random() * 4 + 2) * Math.PI * 2;
    const spinZ = (Math.random() * 3 + 1) * Math.PI * 2;
    
    const targetRotX = startRotX + spinX;
    const targetRotY = startRotY + spinY;
    const targetRotZ = startRotZ + spinZ;
    
    const duration = 800;
    const startTime = performance.now();
    
    function animateRoll(now) {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        
        // Easing cubic out
        const ease = 1 - Math.pow(1 - t, 3);
        
        diceMesh.rotation.x = startRotX + (targetRotX - startRotX) * ease;
        diceMesh.rotation.y = startRotY + (targetRotY - startRotY) * ease;
        diceMesh.rotation.z = startRotZ + (targetRotZ - startRotZ) * ease;
        
        if (t < 1) {
            requestAnimationFrame(animateRoll);
        } else {
            // Бросок закончен
            isRolling = false;
            
            // Определяем выпавшее число (верхняя грань)
            const result = getTopFaceNumber();
            showResult(result);
        }
    }
    
    requestAnimationFrame(animateRoll);
}

// ========== НОВАЯ ВЕРСИЯ - ОПРЕДЕЛЕНИЕ ВЕРХНЕЙ ГРАНИ ==========
function getTopFaceNumber() {
    // Вектор "вверх" в мире
    const worldUp = new THREE.Vector3(0, 1, 0);
    
    // Преобразуем в локальные координаты кубика
    const localUp = worldUp.clone().applyQuaternion(diceMesh.quaternion);
    
    // Все грани с их числами
    const faces = [
        { x: 0.000, y: 1.000, z: 0.000, num: 20 },
        { x: 0.723, y: 0.447, z: 0.525, num: 1 },
        { x: 0.276, y: 0.447, z: 0.851, num: 14 },
        { x: -0.276, y: 0.447, z: 0.851, num: 8 },
        { x: -0.723, y: 0.447, z: 0.525, num: 2 },
        { x: -0.894, y: 0.447, z: 0.000, num: 5 },
        { x: -0.723, y: 0.447, z: -0.525, num: 11 },
        { x: -0.276, y: 0.447, z: -0.851, num: 17 },
        { x: 0.276, y: 0.447, z: -0.851, num: 9 },
        { x: 0.723, y: 0.447, z: -0.525, num: 6 },
        { x: 0.894, y: 0.447, z: 0.000, num: 3 },
        { x: 0.276, y: -0.447, z: 0.851, num: 18 },
        { x: -0.276, y: -0.447, z: 0.851, num: 7 },
        { x: -0.723, y: -0.447, z: 0.525, num: 13 },
        { x: -0.894, y: -0.447, z: 0.000, num: 15 },
        { x: -0.723, y: -0.447, z: -0.525, num: 4 },
        { x: -0.276, y: -0.447, z: -0.851, num: 19 },
        { x: 0.276, y: -0.447, z: -0.851, num: 10 },
        { x: 0.723, y: -0.447, z: -0.525, num: 12 },
        { x: 0.894, y: -0.447, z: 0.000, num: 16 }
    ];
    
    // Находим грань, чья нормаль ближе всего к вектору "вверх"
    let bestMatch = faces[0];
    let bestDot = -Infinity;
    
    faces.forEach(face => {
        const normal = new THREE.Vector3(face.x, face.y, face.z).normalize();
        const dot = localUp.dot(normal);
        if (dot > bestDot) {
            bestDot = dot;
            bestMatch = face;
        }
    });
    
    console.log('Выпало число:', bestMatch.num); // Проверка в консоли
    return bestMatch.num;
}
function showResult(number) {
    // Показываем тост с результатом
    let toast = document.querySelector('.dice-result-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'dice-result-toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = `🎲 Выпало: ${number}`;
    toast.classList.add('show');
    
    // Анимация цифры на кубике (меняем цвет подсветки)
    if (diceMesh && diceMesh.material) {
        diceMesh.material.emissiveIntensity = 0.3;
        setTimeout(() => {
            if (diceMesh && diceMesh.material) {
                diceMesh.material.emissiveIntensity = 0.1;
            }
        }, 200);
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Создаём контейнер для кубика
    if (!document.querySelector('#dice3d-container')) {
        const container = document.createElement('div');
        container.id = 'dice3d-container';
        container.className = 'dice-container';
        container.title = 'Кликни, чтобы бросить d20!';
        document.body.appendChild(container);
        
        // Добавляем обработчик клика
        container.addEventListener('click', rollDice);
        
        // Инициализируем кубик
        initDice();
    }
});