// guide.js - логика справочника

// Данные категорий и правил
const rulesData = {
    players: {
        title: "Правила для игроков",
        items: [
            {
                title: "🎲 Как работают проверки характеристик",
                content: "Когда персонаж пытается совершить действие с шансом на провал, мастер просит бросить d20 и добавить модификатор соответствующей характеристики.<br><br><strong>Пример:</strong> Вы пытаетесь взломать замок → бросок Ловкости + бонус владения инструментами."
            },
            {
                title: "⚔️ Бой: атака и урон",
                content: "<strong>Атака:</strong> d20 + модификатор силы/ловкости + бонус мастерства (если владеешь оружием). Результат должен быть равен или выше КД цели.<br><br><strong>Урон:</strong> Кость оружия + модификатор силы/ловкости."
            },
            {
                title: "✨ Заклинания и магия",
                content: "У каждого заклинания есть уровень (0-9). Заклинателя ограничивают ячейки заклинаний. Некоторые заклинания требуют концентрации — можно поддерживать только одно такое заклинание одновременно."
            },
            {
                title: "🛡️ Классы и расы",
                content: "<strong>Классы:</strong> Воин, Маг, Плут, Жрец, Следопыт, Паладин, Варвар, Друид, Монах, Чародей, Колдун, Бард.<br><strong>Расы:</strong> Человек, Эльф, Дварф, Полурослик, Тифлинг, Драконорождённый, Гном, Полуэльф, Полуорк."
            }
        ]
    },
    dungeonMaster: {
        title: "Советы Мастеру Подземелий",
        items: [
            {
                title: "👥 Создание запоминающихся NPC",
                content: "Дайте NPC: уникальную черту (хромота, тик, странный смех), цель или тайну, голос или манеру речи. Игроки запоминают персонажей с изюминкой."
            },
            {
                title: "⚖️ Баланс боя",
                content: "Используйте калькулятор CR (уровня опасности). Правило «Колодца»: на 4 персонажей 4-го уровня → 4 монстра CR 1 или 1 монстр CR 4. Добавляйте волны врагов вместо одного сильного."
            },
            {
                title: "🏆 Награды и сокровища",
                content: "Кроме золота, давайте: магические предметы (даже одноразовые свитки), земли/титулы, информацию или союзников. Игроки ценят полезные вещи."
            },
            {
                title: "📖 Как вести игру в открытом мире",
                content: "Подготовьте 3-5 локаций, дайте игрокам выбор, создайте «часы» (события, которые случатся, если герои не вмешаются)."
            }
        ]
    },
    basics: {
        title: "Базовые правила для новичков",
        items: [
            {
                title: "🎯 Что такое D&D?",
                content: "Dungeons & Dragons — настольная ролевая игра, где вы создаёте героя и вместе с другими игроками исследуете мир, сражаетесь с монстрами, решаете загадки. Мастер описывает мир, игроки — действия."
            },
            {
                title: "🎲 Какие кубики нужны?",
                content: "d4, d6, d8, d10, d12, d20. Самый важный — d20. Используется для атак, проверок навыков и спасбросков."
            },
            {
                title: "📝 Как создать персонажа?",
                content: "1. Выбери расу. 2. Выбери класс. 3. Распредели характеристики: Сила, Ловкость, Телосложение, Интеллект, Мудрость, Харизма. 4. Выбери навыки и снаряжение."
            },
            {
                title: "🤝 Основные действия в игре",
                content: "<strong>В бою:</strong> Атака, Засада, Отход, Помощь, Уклонение.<br><strong>В исследовании:</strong> Обыск, Взаимодействие, Скрытность.<br><strong>В отыгрыше:</strong> Убеждение, Запугивание, Обман."
            }
        ]
    },
    advanced: {
        title: "Продвинутые механики",
        items: [
            {
                title: "☠️ Состояния и эффекты",
                content: "<strong>Отравлен:</strong> Помеха на атаки и проверки.<br><strong>Оглушён:</strong> Не может действовать.<br><strong>Парализован:</strong> Автоматические криты в ближнем бою.<br><strong>Ослеплён:</strong> Помеха на атаки, автоматический провал проверок, требующих зрения."
            },
            {
                title: "🏃 Вариантные правила",
                content: "<strong>Усталость (6 уровней):</strong> От помехи на проверки до смерти персонажа.<br><strong>Ранения:</strong> При критическом ударе или падении до 0 HP — получаешь травму (сломанное ребро, шрам и т.д.)."
            },
            {
                title: "🗡️ Магические предметы и аттунимент",
                content: "Персонаж может быть «привязан» не более чем к 3 магическим предметам одновременно. Смена привязки требует короткого отдыха."
            }
        ]
    }
};

// Данные статей (свитки мудрости)
const articles = [
    {
        title: "Как создать незабываемого NPC",
        description: "Секреты от опытных мастеров: персонажи, которых игроки запомнят навсегда. Голоса, мотивации и неожиданные повороты.",
        readTime: "15 мин чтения",
        icon: "🎭"
    },
    {
        title: "Баланс боя: как не убить партию",
        description: "Расчет сложности, CR монстров и ловушки, которые добавят драмы без TPK. Советы для молодых мастеров.",
        readTime: "20 мин чтения",
        icon: "⚖️"
    },
    {
        title: "Лор драконов: от древних до теневых",
        description: "Полное руководство по драконьему пантеону, цветам и характерам. Хромовые, медные, серебряные — кто есть кто.",
        readTime: "25 мин чтения",
        icon: "🐉"
    },
    {
        title: "Магия для новичков: школа за школой",
        description: "Разбираем все 8 школ магии: Иллюзия, Некромантия, Очарование и другие. Примеры заклинаний.",
        readTime: "18 мин чтения",
        icon: "🔮"
    },
    {
        title: "10 ловушек, которые удивят игроков",
        description: "Не просто «пройди спасбросок». Интерактивные ловушки, загадки и механизмы для подземелий.",
        readTime: "12 мин чтения",
        icon: "🕳️"
    },
    {
        title: "Создание босс-файтов: этапы и легендарные действия",
        description: "Как сделать битву с боссом эпичной: фазы боя, легендарные действия, лагерь и уязвимости.",
        readTime: "22 мин чтения",
        icon: "👑"
    }
];

// Функция рендеринга выбранной категории
function renderCategory(categoryId) {
    const container = document.getElementById('categoryContent');
    const category = rulesData[categoryId];
    
    if (!category) return;
    
    const html = `
        <h3 style="color: #faa722; margin-bottom: 20px;">${category.title}</h3>
        <div class="rules-list">
            ${category.items.map((item, idx) => `
                <div class="rule-item">
                    <div class="rule-title" data-idx="${idx}">
                        <span class="toggle-icon">▶</span> ${item.title}
                    </div>
                    <div class="rule-content" id="rule-content-${idx}">
                        ${item.content}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = html;
    
    // Добавляем обработчики для раскрывающихся блоков
    document.querySelectorAll('.rule-title').forEach(title => {
        title.addEventListener('click', () => {
            const idx = title.dataset.idx;
            const content = document.getElementById(`rule-content-${idx}`);
            const icon = title.querySelector('.toggle-icon');
            
            if (content.classList.contains('show')) {
                content.classList.remove('show');
                icon.textContent = '▶';
            } else {
                content.classList.add('show');
                icon.textContent = '▼';
            }
        });
    });
}

// Функция рендеринга статей
function renderArticles() {
    const grid = document.getElementById('articlesGrid');
    if (!grid) return;
    
    grid.innerHTML = articles.map(article => `
        <a href="#" class="article-card" onclick="return false;">
            <div class="article-image">${article.icon}</div>
            <div class="article-content">
                <h4>${article.title}</h4>
                <p>${article.description}</p>
                <div class="article-meta">📖 ${article.readTime}</div>
            </div>
        </a>
    `).join('');
}

// Активация категории при клике
function setupCategories() {
    const cards = document.querySelectorAll('.category-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            
            // Убираем active у всех
            cards.forEach(c => c.classList.remove('active'));
            // Добавляем active текущей
            card.classList.add('active');
            
            // Рендерим контент
            renderCategory(category);
            
            // Плавно скроллим к контенту
            document.getElementById('categoryContent')?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        });
    });
    
    // Активируем первую категорию по умолчанию
    if (cards.length > 0) {
        cards[0].classList.add('active');
        renderCategory('players');
    }
}

// Обработчик для кнопки "Все статьи" — перекидывает к свиткам
function setupArticlesLink() {
    const allLink = document.getElementById('allArticlesLink');
    if (allLink) {
        allLink.addEventListener('click', (e) => {
            e.preventDefault();
            const articlesSection = document.querySelector('.wisdom-articles');
            if (articlesSection) {
                articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderArticles();
    setupCategories();
    setupArticlesLink();
});