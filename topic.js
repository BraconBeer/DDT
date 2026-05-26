// topic.js - логика страницы отдельной темы

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
    return { topics: [], nextId: 1 };
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

function getTopicId() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id'));
}

function loadTopic() {
    const topicId = getTopicId();
    
    if (!topicId || isNaN(topicId)) {
        document.getElementById('topicContent').innerHTML = `
            <div class="error-message">
                <h2>❌ Неверный ID темы</h2>
                <p>Пожалуйста, вернитесь в таверну и выберите историю.</p>
                <a href="tavern.html" style="color:#faa722; display:inline-block; margin-top:15px;">Вернуться →</a>
            </div>
        `;
        return;
    }
    
    const forumData = getTavernData();
    const topic = forumData.topics.find(t => t.id === topicId);
    
    if (!topic) {
        document.getElementById('topicContent').innerHTML = `
            <div class="error-message">
                <h2>❌ История не найдена</h2>
                <p>Возможно, она была удалена или никогда не существовала.</p>
                <a href="tavern.html" style="color:#faa722; display:inline-block; margin-top:15px;">Вернуться в таверну →</a>
            </div>
        `;
        return;
    }
    
    document.getElementById('replySection').style.display = 'block';
    document.title = `${topic.title} - Таверна "Веселый Дракон"`;
    
    const replyCount = (topic.replies || []).length;
    
    let allPosts = [
        {
            isFirst: true,
            author: topic.author,
            content: topic.content,
            createdAt: topic.createdAt,
            id: 'first'
        },
        ...(topic.replies || []).map(reply => ({
            isFirst: false,
            author: reply.author,
            content: reply.content,
            createdAt: reply.createdAt,
            id: reply.id
        }))
    ];
    
    allPosts = [
        allPosts[0],
        ...allPosts.slice(1).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    ];
    
      const html = `
        <div style="margin-bottom: 30px; margin-top: 10px;">
            <div class="title-block" style="display: inline-block; margin-bottom: 10px;">
                <h1 style="font-size: 1.6rem; margin: 0;"> ${escapeHtml(topic.title)}</h1>
            </div>
        </div>
        ${allPosts.map(post => `
            <div class="post-card ${post.isFirst ? 'first-post' : ''}">
                <div class="post-header">
                    <div class="post-author">
                        ${post.isFirst ? ' ' : ' '}
                        <span>${escapeHtml(post.author)}</span>
                        ${!post.isFirst ? `<button class="delete-btn" data-reply-id="${post.id}" data-topic-id="${topicId}">🗑 Удалить</button>` : ''}
                    </div>
                    <div class="post-date"> ${new Date(post.createdAt).toLocaleString()} · ${timeAgo(post.createdAt)}</div>
                </div>
                <div class="post-content">
                    ${escapeHtml(post.content).replace(/\n/g, '<br>')}
                </div>
            </div>
        `).join('')}
    `;
    
    document.getElementById('topicContent').innerHTML = html;
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const replyId = parseInt(btn.dataset.replyId);
            const topicIdInt = parseInt(btn.dataset.topicId);
            deleteReply(topicIdInt, replyId);
        });
    });
}

function submitReply() {
    const topicId = getTopicId();
    const replyText = document.getElementById('replyText').value.trim();
    
    if (!replyText) {
        alert('Введите текст ответа!');
        return;
    }
    
    let author = localStorage.getItem('ddt_username');
    if (!author) {
        author = prompt('Введите ваше имя:', 'Путник');
        if (!author) author = 'Аноним';
        localStorage.setItem('ddt_username', author);
    }
    
    const forumData = getTavernData();
    const topic = forumData.topics.find(t => t.id === topicId);
    
    if (!topic) {
        alert('Тема не найдена');
        return;
    }
    
    if (!topic.replies) topic.replies = [];
    
    const newReply = {
        id: Date.now(),
        content: replyText,
        author: author,
        createdAt: new Date().toISOString()
    };
    
    topic.replies.push(newReply);
    saveTavernData(forumData);
    
    document.getElementById('replyText').value = '';
    loadTopic();
}

function deleteReply(topicId, replyId) {
    if (!confirm('Удалить этот ответ?')) return;
    
    const forumData = getTavernData();
    const topic = forumData.topics.find(t => t.id === topicId);
    
    if (topic && topic.replies) {
        topic.replies = topic.replies.filter(r => r.id !== replyId);
        saveTavernData(forumData);
        loadTopic();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadTopic();
    
    const submitBtn = document.getElementById('submitReply');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitReply);
    }
    
    const replyTextarea = document.getElementById('replyText');
    if (replyTextarea) {
        replyTextarea.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                submitReply();
            }
        });
    }
});