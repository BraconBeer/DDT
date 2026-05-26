// tavern.js - вся логика таверны

const STORAGE_KEY = 'ddt_tavern_data';

function getTavernData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch(e) {
            return { topics: [], nextId: 1 };
        }
    }
    // Начальные данные
    const now = new Date();
    return {
        topics: [
            {
                id: 1,
                title: "Как я чуть не сжёг таверну",
                content: "Дело было в Подземье... Мы с партией зашли в таверну после долгого похода. Я, паладин, решил помочь бармену разжечь камин. Но забыл, что у меня в руках был жезл огненных шаров... Короче, таверна выгорела дотла, но бармен сказал, что это лучший пожар в его жизни. Дали мне медаль 'Поджигатель года'.",
                author: "Паладин",
                createdAt: new Date(now - 7200000).toISOString(),
                replies: [
                    { id: 101, content: "Хахах, у нас похожая история была!", author: "Эльф-Лучник", createdAt: new Date(now - 3600000).toISOString() }
                ]
            },
            {
                id: 2,
                title: "Некромант и пропавший ужин",
                content: "Вчера наш некромант оживил курицу, чтобы она сама зашла в суп. Всё пошло не по плану: курица ожила, сбежала и теперь в округе ходят слухи о 'демонической птице'.",
                author: "Варвар",
                createdAt: new Date(now - 18000000).toISOString(),
                replies: []
            },
            {
                id: 3,
                title: "Дракон, который не хотел драться",
                content: "Мы пришли к дракону за сокровищами, а он говорит: 'Ребята, я на больничном, у меня лапы болят. Возьмите золото, только оставьте меня в покое'.",
                author: "Бард",
                createdAt: new Date(now - 86400000).toISOString(),
                replies: [
                    { id: 301, content: "У нас был похожий случай!", author: "Мастер", createdAt: new Date(now - 43200000).toISOString() }
                ]
            }
        ],
        nextId: 4
    };
}

function saveTavernData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'только что';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} мин назад`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} дн назад`;
    return new Date(date).toLocaleDateString();
}

function getDeclension(num, one, two, five) {
    num = Math.abs(num);
    if (num % 10 === 1 && num % 100 !== 11) return one;
    if (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20)) return two;
    return five;
}

let tavernData = getTavernData();

function getPopularTopics(limit = 5) {
    return [...tavernData.topics]
        .sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0))
        .slice(0, limit);
}
function renderTopicsList() {
    const container = document.getElementById('topicsList');
    const emptyMessage = document.getElementById('emptyMessage');
    
    if (!container) return;
    
    if (tavernData.topics.length === 0) {
        container.innerHTML = '';
        if (emptyMessage) emptyMessage.style.display = 'block';
        return;
    }
    
    if (emptyMessage) emptyMessage.style.display = 'none';
    
    const sortedTopics = [...tavernData.topics].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    container.innerHTML = sortedTopics.map(topic => {
        const replyCount = topic.replies ? topic.replies.length : 0;
        const lastReply = topic.replies && topic.replies.length > 0 
            ? topic.replies[topic.replies.length - 1] 
            : null;
        const lastDate = lastReply ? new Date(lastReply.createdAt) : new Date(topic.createdAt);
        const lastAuthor = lastReply ? lastReply.author : topic.author;
        
        let badge = '';
        if (replyCount >= 5) badge = '<span class="badge-hot">Горячо 🔥</span>';
        else if (new Date(topic.createdAt) > new Date(Date.now() - 86400000)) badge = '<span class="badge-new">Новое ✨</span>';
        
        return `
            <div class="topic-card" style="position: relative;">
                <div class="topic-info" onclick="location.href='topic.html?id=${topic.id}'" style="cursor: pointer; flex: 1;">
                    <div class="topic-title">
                        ${escapeHtml(topic.title)}
                        ${badge}
                    </div>
                    <div class="topic-meta">
                        <span> ${escapeHtml(topic.author)}</span>
                        <span> ${new Date(topic.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="topic-stats" onclick="location.href='topic.html?id=${topic.id}'" style="cursor: pointer;">
                    
                    <div class="topic-last">⬅ ${escapeHtml(lastAuthor)} · ${timeAgo(lastDate)}</div>
                </div>
                <button class="delete-topic-btn" data-topic-id="${topic.id}" style="position: absolute; top: 15px; right: 15px; background: #51161a; border: none; color: #82915c; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 12px;">✕</button>
            </div>
        `;
    }).join('');
    
    // Добавляем обработчики на кнопки удаления
    document.querySelectorAll('.delete-topic-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // чтобы не открывать тему
            const topicId = parseInt(btn.dataset.topicId);
            deleteTopic(topicId);
        });
    });
    
    renderHotTopics();
}

// Новая функция удаления темы
function deleteTopic(topicId) {
    if (!confirm('Удалить эту историю навсегда?')) return;
    
    const index = tavernData.topics.findIndex(t => t.id === topicId);
    if (index !== -1) {
        tavernData.topics.splice(index, 1);
        saveTavernData(tavernData);
        renderTopicsList();
        
        // Уведомляем другие вкладки
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    }
}
function renderHotTopics() {
    const container = document.getElementById('hotTopicsList');
    if (!container) return;
    
    const popular = getPopularTopics(5);
    
    if (popular.length === 0) {
        container.innerHTML = '<p style="color:#82915c;">Пока нет популярных историй</p>';
        return;
    }
    
    container.innerHTML = popular.map(topic => {
        const replyCount = topic.replies?.length || 0;
        return `
            <div class="hot-topic-item" onclick="location.href='topic.html?id=${topic.id}'">
                <span class="hot-topic-title">${escapeHtml(topic.title.length > 45 ? topic.title.substring(0,45)+'...' : topic.title)}</span>
                <span class="hot-topic-meta">${replyCount} ${getDeclension(replyCount, 'ответ', 'ответа', 'ответов')} · ${escapeHtml(topic.author)}</span>
            </div>
        `;
    }).join('');
}

function createTopic(title, content, author) {
    if (!title.trim() || !content.trim()) {
        alert('Заполните заголовок и текст истории!');
        return false;
    }
    
    const newTopic = {
        id: tavernData.nextId++,
        title: title.trim(),
        content: content.trim(),
        author: author || 'Путник',
        createdAt: new Date().toISOString(),
        replies: []
    };
    
    tavernData.topics.push(newTopic);
    saveTavernData(tavernData);
    renderTopicsList();
    return true;
}

function setupModal() {
    const modal = document.getElementById('topicModal');
    const newBtn = document.getElementById('newTopicBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const submitBtn = document.getElementById('submitTopicBtn');
    const titleInput = document.getElementById('topicTitle');
    const contentInput = document.getElementById('topicContent');
    
    if (!modal) return;
    
    function openModal() {
        modal.style.display = 'flex';
        titleInput.value = '';
        contentInput.value = '';
        titleInput.focus();
    }
    
    function closeModal() {
        modal.style.display = 'none';
    }
    
    newBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    submitBtn.addEventListener('click', () => {
        const title = titleInput.value;
        const content = contentInput.value;
        let author = localStorage.getItem('ddt_username');
        if (!author) {
            author = prompt('Введите ваше имя:', 'Путник');
            if (!author) author = 'Аноним';
            localStorage.setItem('ddt_username', author);
        }
        
        if (createTopic(title, content, author)) {
            closeModal();
            setTimeout(() => {
                const topicsList = document.getElementById('topicsList');
                if (topicsList && topicsList.firstChild) {
                    topicsList.firstChild.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderTopicsList();
    setupModal();
});