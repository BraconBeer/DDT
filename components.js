// components.js — общие элементы для всех страниц

// Кеш для поиска (чтобы не грузить страницы каждый раз)
let searchCache = null;
let isBuildingCache = false;

function loadComponents() {
    // ========== 1. Кнопка НАЗАД (слева от логотипа) ==========
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isMainPage = (currentPage === 'index.html');
    
    if (!isMainPage) {
        // Проверяем, нет ли уже кнопки, чтобы не дублировать
        if (!document.querySelector('.back-to-main-btn')) {
            const backBtn = document.createElement('a');
            backBtn.href = 'javascript:history.back()';
            backBtn.className = 'back-to-main-btn';
            backBtn.innerHTML = '← Назад';
            backBtn.style.cssText = `
                position: fixed;
                top: 15px;
                left: 20px;
                z-index: 101;
                background: #51161a;
                color: #ecd8b2;
                text-decoration: none;
                font-family: 'Underdog', system-ui;
                font-size: 1.2rem;
                padding: 10px 20px;
                border-radius: 40px;
                transition: all 0.2s;
                cursor: pointer;
                font-weight: bold;
            `;
            backBtn.onmouseover = () => backBtn.style.backgroundColor = '#6a2025';
            backBtn.onmouseout = () => backBtn.style.backgroundColor = '#51161a';
            document.body.appendChild(backBtn);
        }
    }

    // ========== 2. Top bar (правые кнопки) ==========
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
        topBar.innerHTML = `
            <div class="top-bar-buttons">
                <a href="tavern.html" class="top-btn">Таверна</a>
                <a href="#" class="top-btn">Войти</a>
                <a href="#" class="top-btn">⚙️</a>
                <a href="#" class="top-btn">🔔</a>
            </div>
        `;
    }
    
    // ========== 3. Логотип ==========
    const logo = document.querySelector('.logo-flag');
    if (logo) {
        logo.innerHTML = `<img src="../Picture/Logo2.png" alt="DnD Logo">`;
        logo.href = "../index.html";
    }

    // ========== 4. Создание структуры с боковыми панелями ==========
    setupSidebarLayout();
    
    // ========== 5. Поиск ==========
    const searchBar = document.querySelector('.search-bar');
    if (searchBar && !searchBar.hasAttribute('data-initialized')) {
        const searchInput = searchBar.querySelector('.search-input');
        if (searchInput) {
            searchBar.setAttribute('data-initialized', 'true');
            
            const currentPath = window.location.pathname;
            const isMainPageCheck = currentPath.endsWith('index.html') || 
                               currentPath.endsWith('/') || 
                               currentPath.split('/').pop() === '' ||
                               currentPath.split('/').pop() === 'index.html';
            
            if (isMainPageCheck) {
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase().trim();
                    globalSearch(query);
                });
            } else {
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase().trim();
                    localSearchOnPage(query);
                });
            }
        }
    }
}
function setupSidebarLayout() {
    const pageWrapper = document.querySelector('.page-wrapper');
    const mainContent = document.querySelector('.main-content');
    const container = document.querySelector('.container');
    
    if (!pageWrapper || !mainContent) return;
    
    // Проверяем, не добавлены ли уже панели
    if (document.querySelector('.main-layout')) return;
    
    // Создаем новую структуру
    const layout = document.createElement('div');
    layout.className = 'main-layout';
    
    // Левая панель (меню) - компактная
    const leftSidebar = document.createElement('aside');
    leftSidebar.className = 'sidebar-left';
    leftSidebar.innerHTML = `
        <div class="sidebar-card">
            <h3>Меню</h3>
            <ul class="sidebar-menu">
                <li><a href="index.html">Главная</a></li>
                <li><a href="guide.html">Справочник</a></li>
                <li><a href="bestiary.html">Бестиарий</a></li>
                <li><a href="tavern.html">Таверна</a></li>
            </ul>
        </div>
    `;
    
    // Правая панель - с монстром дня и историями
    const rightSidebar = document.createElement('aside');
    rightSidebar.className = 'sidebar-right';
    rightSidebar.innerHTML = `
        <div class="sidebar-card">
            <h3>Монстр дня</h3>
            <div class="monster-of-day" id="monsterOfDay">
                <img class="monster-of-day-img" id="monsterImg" src="" alt="Монстр">
                <div class="monster-of-day-name" id="monsterName">Загрузка...</div>
                <div class="monster-of-day-type" id="monsterType"></div>
                <a href="#" id="monsterLink" class="monster-link">Подробнее →</a>
            </div>
        </div>
        <div class="sidebar-card">
            <h3>Свежие истории</h3>
            <div id="freshStoriesList">
                <div style="color:#82915c; font-size:0.8rem;">Загрузка...</div>
            </div>
        </div>
    `;
    
    // Переносим контент
    const centerDiv = document.createElement('div');
    centerDiv.className = 'main-center';
    
    // Перемещаем mainContent внутрь centerDiv
    mainContent.parentNode.insertBefore(layout, mainContent);
    layout.appendChild(leftSidebar);
    layout.appendChild(centerDiv);
    layout.appendChild(rightSidebar);
    centerDiv.appendChild(mainContent);
    
    // Подсвечиваем активную ссылку в меню
    highlightActiveMenu();
    
    // Загружаем монстра дня
    loadMonsterOfDay();
    
    // Загружаем свежие истории
    loadFreshStories();
    
    // Обновляем каждые 30 секунд (если надо)
    setInterval(() => {
        loadFreshStories();
    }, 30000);
}
// ========== МОНСТР ДНЯ ==========
const monstersOfDay = [
    { name: "Красный дракон", type: "Дракон", cr: 10, img: "../Picture/RedDragon.webp", url: "creatures/red-dragon.html" },
    { name: "Лич", type: "Нежить", cr: 21, img: "https://cdn-icons-png.flaticon.com/512/3212/3212741.png", url: "creatures/lich.html" },
    { name: "Бихолдер", type: "Аберрация", cr: 13, img: "https://cdn.pixabay.com/photo/2020/04/08/06/23/eye-5015412_640.png", url: "creatures/beholder.html" },
    { name: "Тролль", type: "Великан", cr: 5, img: "https://cdn-icons-png.flaticon.com/512/2563/2563770.png", url: "creatures/troll.html" },
    { name: "Псевдодракон", type: "Дракон", cr: 0.25, img: "https://cdn-icons-png.flaticon.com/512/616/616548.png", url: "creatures/pseudodragon.html" }
];

function loadMonsterOfDay() {
    // Выбираем монстра на основе дня года
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const monster = monstersOfDay[dayOfYear % monstersOfDay.length];
    
    const imgEl = document.getElementById('monsterImg');
    const nameEl = document.getElementById('monsterName');
    const typeEl = document.getElementById('monsterType');
    const linkEl = document.getElementById('monsterLink');
    
    if (imgEl) imgEl.src = monster.img;
    if (nameEl) nameEl.textContent = monster.name;
    if (typeEl) typeEl.textContent = `${monster.type} · Ур. ${monster.cr}`;
    if (linkEl) linkEl.href = monster.url;
}

// ========== СВЕЖИЕ ИСТОРИИ ИЗ ТАВЕРНЫ ==========
function loadFreshStories() {
    const container = document.getElementById('freshStoriesList');
    if (!container) return;
    
    const stored = localStorage.getItem('ddt_tavern_data');
    if (!stored) {
        container.innerHTML = `
            <div class="fresh-story-item" onclick="location.href='tavern.html'">
                <span class="fresh-story-title">Как я чуть не сжёг таверну</span>
                <span class="fresh-story-meta">Паладин · 2 ч назад</span>
            </div>
            <div class="fresh-story-item" onclick="location.href='tavern.html'">
                <span class="fresh-story-title">Некромант и пропавший ужин</span>
                <span class="fresh-story-meta">Варвар · 5 ч назад</span>
            </div>
            <div class="fresh-story-item" onclick="location.href='tavern.html'">
                <span class="fresh-story-title">Дракон, который не хотел драться</span>
                <span class="fresh-story-meta">Бард · вчера</span>
            </div>
        `;
        return;
    }
    
    try {
        const data = JSON.parse(stored);
        const topics = data.topics || [];
        
        // Берём 3 самые новые
        const fresh = [...topics]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 4);
        
        if (fresh.length === 0) {
            container.innerHTML = '<div style="color:#82915c; font-size:0.8rem; text-align:center;">Пока нет историй 🍺</div>';
            return;
        }
        
        function timeAgoShort(date) {
            const seconds = Math.floor((new Date() - new Date(date)) / 1000);
            if (seconds < 60) return 'только что';
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes} мин`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours} ч`;
            const days = Math.floor(hours / 24);
            if (days < 7) return `${days} дн`;
            return new Date(date).toLocaleDateString();
        }
        
        container.innerHTML = fresh.map(topic => `
            <div class="fresh-story-item" onclick="location.href='topic.html?id=${topic.id}'">
                <span class="fresh-story-title">${escapeHtmlSimple(topic.title.substring(0, 35))}${topic.title.length > 35 ? '…' : ''}</span>
                <span class="fresh-story-meta">👤 ${escapeHtmlSimple(topic.author)} · ${timeAgoShort(topic.createdAt)} · 💬 ${topic.replies?.length || 0}</span>
            </div>
        `).join('');
        
    } catch(e) {
        console.error('Ошибка загрузки историй:', e);
    }
}

function escapeHtmlSimple(text) {
    if (!text) return '';
    return text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function highlightActiveMenu() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.sidebar-menu a');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else if (currentPage === 'topic.html' && href === 'tavern.html') {
            link.classList.add('active');
        }
    });
}
function highlightActiveMenu() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.sidebar-menu a');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else if (currentPage === 'topic.html' && href === 'tavern.html') {
            // На странице темы подсвечиваем Таверну
            link.classList.add('active');
        }
    });
}

const tips = [
    "«Никогда не разделяй группу в подземелье!»",
    "«Кубики любят, когда их бросают с верой в успех»",
    "«Лучший NPC — тот, у которого есть секрет»",
    "«Иногда отступление — это стратегия, а не трусость»",
    "«Драконы тоже любят шутки. Но не над ними»",
    "«Каждый критический провал — это начало новой истории»",
    "«Мастер всегда прав. Даже когда ошибается»"
];

function loadRandomTip() {
    const tipElement = document.getElementById('randomTip');
    if (tipElement) {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        tipElement.textContent = randomTip;
    }
}

function updateSidebarStats() {
    const stored = localStorage.getItem('ddt_tavern_data');
    if (stored) {
        try {
            const data = JSON.parse(stored);
            const topics = data.topics || [];
            
            // Считаем истории за сегодня
            const today = new Date().toDateString();
            const todayTopics = topics.filter(t => new Date(t.createdAt).toDateString() === today);
            
            const statusDiv = document.getElementById('activeTopics');
            if (statusDiv) {
                statusDiv.innerHTML = `Сегодня: ${todayTopics.length} историй`;
            }
        } catch(e) {}
    }
    
    // Обновляем при изменении данных
    window.addEventListener('storage', (e) => {
        if (e.key === 'ddt_tavern_data') {
            updateSidebarStats();
        }
    });
}

// ========== ОСТАЛЬНОЙ КОД ОСТАЁТСЯ БЕЗ ИЗМЕНЕНИЙ ==========
// (globalSearch, buildSearchCache, displayGlobalResults и т.д.)

async function globalSearch(query) {
    if (!query) {
        showAllMainPageContent();
        removeSearchResults();
        return;
    }
    
    showLoadingIndicator();
    
    if (!searchCache) {
        await buildSearchCache();
    }
    
    hideLoadingIndicator();
    
    const results = [];
    
    for (const page of searchCache) {
        const matches = [];
        
        for (const title of page.titles) {
            if (title.toLowerCase().includes(query)) {
                matches.push({ text: title, type: 'title' });
            }
        }
        
        for (const text of page.texts) {
            if (text.toLowerCase().includes(query)) {
                matches.push({ text: text.substring(0, 100), type: 'text' });
                break;
            }
        }
        
        if (matches.length > 0) {
            results.push({
                url: page.url,
                title: page.pageTitle,
                snippet: matches[0].text,
                type: page.type
            });
        }
    }
    
    displayGlobalResults(results, query);
}

async function buildSearchCache() {
    if (isBuildingCache) return;
    isBuildingCache = true;
    
    const pagesToIndex = [
        { url: 'index.html', type: 'Главная' },
        { url: 'guide.html', type: 'Справочник' },
        { url: 'bestiary.html', type: 'Бестиарий' },
        { url: 'tools.html', type: 'Инструменты' },
        { url: 'creatures/red-dragon.html', type: 'Существо' },
        { url: 'creatures/lich.html', type: 'Существо' },
        { url: 'creatures/beholder.html', type: 'Существо' },
        { url: 'creatures/troll.html', type: 'Существо' },
        { url: 'creatures/pseudodragon.html', type: 'Существо' }
    ];
    
    searchCache = [];
    
    for (const page of pagesToIndex) {
        try {
            const response = await fetch(page.url);
            const html = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const pageTitle = doc.querySelector('title')?.innerText || page.url;
            
            const titles = [];
            doc.querySelectorAll('h1, h2, h3, .card h2, .tile-name, .story-title').forEach(el => {
                const text = el.innerText.trim();
                if (text && text.length > 0 && text.length < 200) {
                    titles.push(text);
                }
            });
            
            const texts = [];
            const importantSelectors = [
                '.card p', '.story-title', '.tile-name', '.tile-type',
                '.article-vertical-content p', '.article-vertical-content h3',
                '.creature-title h1', '.attribute-card .attr-name',
                '.ability-title', '.action-name'
            ];
            
            importantSelectors.forEach(selector => {
                doc.querySelectorAll(selector).forEach(el => {
                    const text = el.innerText.trim();
                    if (text && text.length > 0 && text.length < 300) {
                        texts.push(text);
                    }
                });
            });
            
            searchCache.push({
                url: page.url,
                pageTitle: pageTitle,
                titles: titles,
                texts: texts,
                type: page.type
            });
            
        } catch (e) {
            console.warn(`Не удалось загрузить ${page.url}:`, e);
        }
    }
    
    isBuildingCache = false;
}

function displayGlobalResults(results, query) {
    const cardsGrid = document.querySelector('.cards-grid');
    const storiesSection = document.querySelector('.stories-section');
    const wisdomCard = document.querySelector('.wisdom-card');
    
    if (cardsGrid) cardsGrid.style.display = 'none';
    if (storiesSection) storiesSection.style.display = 'none';
    if (wisdomCard) wisdomCard.style.display = 'none';
    
    let resultsBlock = document.querySelector('.search-results-block');
    if (!resultsBlock) {
        resultsBlock = document.createElement('div');
        resultsBlock.className = 'search-results-block';
        const container = document.querySelector('.container');
        if (container) container.appendChild(resultsBlock);
    }
    
    if (results.length === 0) {
        resultsBlock.innerHTML = `
            <div style="background:#2c3b23; border-radius:30px; padding:40px; text-align:center; border:1px solid #ecd8b2; margin:20px 0;">
                <div style="font-size:3rem;">🔍</div>
                <h3 style="color:#faa722;">Ничего не найдено</h3>
                <p style="color:#ecd8b2;">По запросу «${query}» ничего не нашлось</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div style="background:#2c3b23; border-radius:30px; padding:25px; border:1px solid #ecd8b2; margin:20px 0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:2px solid #ecd8b2; padding-bottom:15px;">
                <h2 style="color:#faa722;">Результаты поиска (${results.length})</h2>
                <button id="clearSearchBtn" style="background:#51161a; border:none; color:#ecd8b2; padding:8px 16px; border-radius:30px; cursor:pointer;">✖ Очистить</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:12px;">
    `;
    
    results.forEach(result => {
        html += `
            <a href="${result.url}" style="display:block; padding:15px; background:#3a4d2e; border-radius:20px; text-decoration:none; transition:transform 0.2s;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
                    <div>
                        <span style="background:#51161a; padding:2px 10px; border-radius:20px; font-size:0.7rem; color:#ecd8b2;">${result.type}</span>
                        <div style="color:#faa722; font-weight:bold; margin:8px 0 4px;">${result.title}</div>
                        <div style="color:#82915c; font-size:0.85rem;">${result.snippet.substring(0, 150)}${result.snippet.length > 150 ? '…' : ''}</div>
                    </div>
                    <div style="color:#82915c; font-size:1.2rem;">→</div>
                </div>
            </a>
        `;
    });
    
    html += `</div></div>`;
    resultsBlock.innerHTML = html;
    
    document.getElementById('clearSearchBtn')?.addEventListener('click', () => {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) searchInput.value = '';
        showAllMainPageContent();
        removeSearchResults();
    });
}

function showAllMainPageContent() {
    const cardsGrid = document.querySelector('.cards-grid');
    const storiesSection = document.querySelector('.stories-section');
    const wisdomCard = document.querySelector('.wisdom-card');
    
    if (cardsGrid) cardsGrid.style.display = '';
    if (storiesSection) storiesSection.style.display = '';
    if (wisdomCard) wisdomCard.style.display = '';
}

function removeSearchResults() {
    const block = document.querySelector('.search-results-block');
    if (block) block.remove();
}

function showLoadingIndicator() {
    let loader = document.querySelector('.search-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.className = 'search-loader';
        loader.style.cssText = 'text-align:center; padding:40px; color:#ecd8b2;';
        loader.innerHTML = '🔍 Поиск по сайту...';
        const container = document.querySelector('.container');
        if (container) container.prepend(loader);
    }
}

function hideLoadingIndicator() {
    const loader = document.querySelector('.search-loader');
    if (loader) loader.remove();
}

function localSearchOnPage(query) {
    const creatureTiles = document.querySelectorAll('.creature-tile');
    if (creatureTiles.length > 0) {
        creatureTiles.forEach(tile => {
            const text = tile.innerText.toLowerCase();
            tile.style.display = (!query || text.includes(query)) ? '' : 'none';
        });
        
        const grid = document.querySelector('.compact-grid');
        if (grid) {
            const anyVisible = Array.from(creatureTiles).some(t => t.style.display !== 'none');
            let msg = grid.querySelector('.no-results-message');
            if (!anyVisible && query) {
                if (!msg) {
                    msg = document.createElement('div');
                    msg.className = 'no-results-message';
                    msg.style.cssText = 'grid-column:1/-1; text-align:center; padding:40px; background:#2c3b23; border-radius:30px; color:#ecd8b2;';
                    msg.innerHTML = 'Нет существ по вашему запросу';
                    grid.appendChild(msg);
                }
            } else if (msg) {
                msg.remove();
            }
        }
        return;
    }
    
    if (!query) {
        document.querySelectorAll('[style*="display: none"]').forEach(el => el.style.display = '');
    }
    
}

document.addEventListener("DOMContentLoaded", loadComponents);