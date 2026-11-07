/**
 * Мұғалімнің көмекші құралдары (Таймер, Топқа бөлу, Сабақ жоспары, Рефлексия)
 */

const TeacherTools = {
  timerSeconds: 45 * 60,
  timerInterval: null,
  isTimerRunning: false,

  initTimer() {
    this.updateTimerDisplay();
  },

  toggleTimer() {
    if (this.isTimerRunning) {
      clearInterval(this.timerInterval);
      this.isTimerRunning = false;
      document.getElementById('btn-timer-toggle').innerText = '▶️ Бастау';
    } else {
      this.isTimerRunning = true;
      document.getElementById('btn-timer-toggle').innerText = '⏸️ Кідірту';
      this.timerInterval = setInterval(() => {
        if (this.timerSeconds > 0) {
          this.timerSeconds--;
          this.updateTimerDisplay();
        } else {
          clearInterval(this.timerInterval);
          this.isTimerRunning = false;
          alert('⏰ Сабақ уақыты аяқталды!');
        }
      }, 1000);
    }
  },

  resetTimer(minutes = 45) {
    clearInterval(this.timerInterval);
    this.isTimerRunning = false;
    this.timerSeconds = minutes * 60;
    this.updateTimerDisplay();
    const btn = document.getElementById('btn-timer-toggle');
    if (btn) btn.innerText = '▶️ Бастау';
  },

  updateTimerDisplay() {
    const mins = Math.floor(this.timerSeconds / 60);
    const secs = this.timerSeconds % 60;
    const str = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const el = document.getElementById('timer-display');
    if (el) el.innerText = str;
  },

  // Топқа бөлу генераторы
  splitGroups() {
    const rawNames = document.getElementById('students-input').value.trim();
    if (!rawNames) {
      alert('Оқушылар тізімін енгізіңіз!');
      return;
    }

    const names = rawNames.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    if (names.length === 0) return;

    // Тізімді кездейсоқ араластыру (Fisher-Yates)
    for (let i = names.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [names[i], names[j]] = [names[j], names[i]];
    }

    const groups = [[], [], []];
    names.forEach((name, idx) => {
      groups[idx % 3].push(name);
    });

    const g1List = document.getElementById('group-1-list');
    const g2List = document.getElementById('group-2-list');
    const g3List = document.getElementById('group-3-list');

    g1List.innerHTML = groups[0].map(s => `<li>👤 ${s}</li>`).join('');
    g2List.innerHTML = groups[1].map(s => `<li>👤 ${s}</li>`).join('');
    g3List.innerHTML = groups[2].map(s => `<li>👤 ${s}</li>`).join('');

    if (window.sounds) window.sounds.playCorrect();
  },

  openPlanModal() {
    document.getElementById('plan-modal').classList.add('active');
  },

  closePlanModal() {
    document.getElementById('plan-modal').classList.remove('active');
  },

  openGroupsModal() {
    document.getElementById('groups-modal').classList.add('active');
  },

  closeGroupsModal() {
    document.getElementById('groups-modal').classList.remove('active');
  }
};

window.TeacherTools = TeacherTools;
