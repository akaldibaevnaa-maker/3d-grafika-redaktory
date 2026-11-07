/**
 * 7-сынып ашық сабағына арналған интерактивті 10-балдық бағалау жүйесі
 * 12 оқушының тізімі, жұлдыздар, қатысу мәртебелері және автоматты сақтау
 */

const GradingSystem = {
  students: [
    { id: 1, name: "Абай Зерде", score: 0, status: "present" },
    { id: 2, name: "Амангелді Мұхамедәли", score: 0, status: "present" },
    { id: 3, name: "Әбдіқаппар Ақназым", score: 0, status: "present" },
    { id: 4, name: "Әбдіраман Берекет", score: 0, status: "present" },
    { id: 5, name: "Әдебиет Мереке", score: 0, status: "present" },
    { id: 6, name: "Әліпбай Айару", score: 0, status: "present" },
    { id: 7, name: "Еркен Мирас", score: 0, status: "present" },
    { id: 8, name: "Жақсылық Қарақат", score: 0, status: "present" },
    { id: 9, name: "Жетес Мирас", score: 0, status: "present" },
    { id: 10, name: "Қанатқызы Маржан", score: 0, status: "present" },
    { id: 11, name: "Сағатбек Кәусар", score: 0, status: "present" },
    { id: 12, name: "Сұлтан Нұрислам", score: 0, status: "present" }
  ],

  storageKey: "grade_7_class_lesson_data_v2",

  init() {
    this.loadFromStorage();
    this.renderTable();
    this.updateStats();
  },

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach(item => {
            const s = this.students.find(st => st.id === item.id);
            if (s) {
              s.score = typeof item.score === 'number' ? item.score : 0;
              s.status = item.status || 'present';
            }
          });
        }
      }
    } catch (e) {
      console.warn("Storage жүктеу қатесі:", e);
    }
  },

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.students));
    } catch (e) {}
    this.updateStats();
  },

  // Жұлдызшаны / баллды орнату (1-ден 10-ға дейін)
  setScore(studentId, scoreVal) {
    const s = this.students.find(item => item.id === studentId);
    if (!s) return;

    if (s.status !== 'present') {
      alert(`${s.name} сабақта жоқ (${this.getStatusLabel(s.status)}). Баға қою үшін оны «Қатысуда» күйіне ауыстырыңыз.`);
      return;
    }

    s.score = parseInt(scoreVal, 10);
    this.saveToStorage();
    this.renderRow(studentId);

    if (window.sounds) {
      if (s.score === 10) window.sounds.playSuccessFanfare();
      else window.sounds.playCorrect();
    }
  },

  // +1 Жұлдыз қосу
  addStar(studentId) {
    const s = this.students.find(item => item.id === studentId);
    if (!s) return;

    if (s.status !== 'present') {
      alert(`${s.name} сабақта жоқ. Алдымен қатысуын белгілеңіз.`);
      return;
    }

    if (s.score < 10) {
      s.score++;
      this.saveToStorage();
      this.renderRow(studentId);
      if (window.sounds) {
        if (s.score === 10) window.sounds.playSuccessFanfare();
        else window.sounds.playCorrect();
      }
    }
  },

  // -1 Жұлдыз азайту
  removeStar(studentId) {
    const s = this.students.find(item => item.id === studentId);
    if (!s) return;

    if (s.score > 0) {
      s.score--;
      this.saveToStorage();
      this.renderRow(studentId);
      if (window.sounds) window.sounds.playClick();
    }
  },

  // Қатысу мәртебесін өзгерту (present / excused / unexcused / ill)
  setStatus(studentId, newStatus) {
    const s = this.students.find(item => item.id === studentId);
    if (!s) return;

    s.status = newStatus;
    if (newStatus !== 'present') {
      s.score = 0; // Сабақта жоқ болса балл нөлге түседі
    }
    this.saveToStorage();
    this.renderRow(studentId);
    if (window.sounds) window.sounds.playClick();
  },

  getStatusLabel(status) {
    switch (status) {
      case 'present': return 'Қатысуда';
      case 'excused': return 'Себепті';
      case 'unexcused': return 'Себепсіз';
      case 'ill': return 'Ауырды';
      default: return status;
    }
  },

  // Балл түсінің индикаторы (Kundelik стилі)
  getScoreBadgeClass(score) {
    if (score >= 9) return 'score-excellent'; // 9-10 жасыл
    if (score >= 7) return 'score-good';      // 7-8 көк/сары
    if (score >= 4) return 'score-average';   // 4-6 қызғылт сары
    if (score >= 1) return 'score-low';       // 1-3 қызыл
    return 'score-zero';
  },

  // 1-жолды динамикалық жаңарту
  renderRow(studentId) {
    const s = this.students.find(item => item.id === studentId);
    if (!s) return;
    const rowEl = document.getElementById(`student-row-${studentId}`);
    if (!rowEl) return;

    rowEl.innerHTML = this.generateRowHtml(s);
  },

  generateRowHtml(s) {
    const isPresent = s.status === 'present';

    // 1-ден 10-ға дейінгі жұлдызшалар
    let starsHtml = '';
    for (let i = 1; i <= 10; i++) {
      const isFilled = i <= s.score;
      starsHtml += `
        <span class="star-icon ${isFilled ? 'filled' : ''} ${!isPresent ? 'disabled' : ''}" 
              title="${i} балл" 
              onclick="GradingSystem.setScore(${s.id}, ${i})">★</span>
      `;
    }

    return `
      <td class="col-num">${s.id}</td>
      <td class="col-name">
        <strong>${s.name}</strong>
      </td>
      <td class="col-attendance">
        <div class="status-btn-group">
          <button class="status-btn ${s.status === 'present' ? 'active-present' : ''}" 
                  onclick="GradingSystem.setStatus(${s.id}, 'present')" title="Сабақта бар">
            ✅ Бар
          </button>
          <button class="status-btn ${s.status === 'excused' ? 'active-excused' : ''}" 
                  onclick="GradingSystem.setStatus(${s.id}, 'excused')" title="Себепті келмеді">
            📋 Себепті
          </button>
          <button class="status-btn ${s.status === 'unexcused' ? 'active-unexcused' : ''}" 
                  onclick="GradingSystem.setStatus(${s.id}, 'unexcused')" title="Себепсіз жоқ">
            ❌ Себепсіз
          </button>
          <button class="status-btn ${s.status === 'ill' ? 'active-ill' : ''}" 
                  onclick="GradingSystem.setStatus(${s.id}, 'ill')" title="Ауырып қалды">
            🏥 Ауырды
          </button>
        </div>
      </td>
      <td class="col-stars">
        <div class="stars-container">
          ${starsHtml}
        </div>
      </td>
      <td class="col-controls">
        <button class="btn-step-score" onclick="GradingSystem.removeStar(${s.id})" ${!isPresent || s.score === 0 ? 'disabled' : ''}>-</button>
        <button class="btn-step-score" onclick="GradingSystem.addStar(${s.id})" ${!isPresent || s.score === 10 ? 'disabled' : ''}>+</button>
      </td>
      <td class="col-score">
        ${isPresent ? `
          <div class="score-badge ${this.getScoreBadgeClass(s.score)}">
            ${s.score} <span class="score-max">/10</span>
          </div>
        ` : `
          <div class="status-text-badge status-${s.status}">
            ${this.getStatusLabel(s.status)}
          </div>
        `}
      </td>
    `;
  },

  renderTable() {
    const tbody = document.getElementById('grading-table-body');
    if (!tbody) return;

    tbody.innerHTML = this.students.map(s => `
      <tr id="student-row-${s.id}" class="student-row ${s.status !== 'present' ? 'row-absent' : ''}">
        ${this.generateRowHtml(s)}
      </tr>
    `).join('');
  },

  updateStats() {
    const totalCount = this.students.length;
    const presentCount = this.students.filter(s => s.status === 'present').length;
    const absentCount = this.students.length - presentCount;

    const presentStudents = this.students.filter(s => s.status === 'present');
    const totalScore = presentStudents.reduce((sum, s) => sum + s.score, 0);
    const avgScore = presentStudents.length > 0 ? (totalScore / presentStudents.length).toFixed(1) : "0.0";

    const tEl = document.getElementById('stat-total-count');
    const pEl = document.getElementById('stat-present-count');
    const aEl = document.getElementById('stat-absent-count');
    const avgEl = document.getElementById('stat-avg-score');

    if (tEl) tEl.innerText = `${totalCount} оқушы`;
    if (pEl) pEl.innerText = presentCount;
    if (aEl) aEl.innerText = absentCount;
    if (avgEl) avgEl.innerText = avgScore;
  },

  // Барлығына бірден 10 балл қою (Марапаттау)
  awardAll10() {
    if (!confirm('Сабақта отырған барлық оқушыға 10 балл қойылсын ба?')) return;
    this.students.forEach(s => {
      if (s.status === 'present') s.score = 10;
    });
    this.saveToStorage();
    this.renderTable();
    if (window.sounds) window.sounds.playSuccessFanfare();
    if (typeof confetti === 'function') {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  },

  // Бағаларды тазарту / Жаңа сабақ бастау
  resetAll() {
    if (!confirm('Барлық оқушылардың бағаларын қайтадан бастапқы нөлге түсіресіз бе?')) return;
    this.students.forEach(s => {
      s.score = 0;
      s.status = 'present';
    });
    this.saveToStorage();
    this.renderTable();
    if (window.sounds) window.sounds.playClick();
  },

  // Бағалау парағын басып шығару (Print)
  printSheet() {
    window.print();
  }
};

window.GradingSystem = GradingSystem;
