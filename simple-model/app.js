const directory = document.querySelector('#directory');
const lesson = document.querySelector('#lesson');
const openButton = document.querySelector('#open-type2');
const backButton = document.querySelector('#back-directory');
const title = document.querySelector('#lesson-title');
const diagram = document.querySelector('#mechanism-diagram');
const questionCore = document.querySelector('#question-core');
const explanation = document.querySelector('#explanation');
const summary = document.querySelector('#summary');

const questions = [
  {
    context: '抗体正在寻找红细胞表面的固定抗原',
    title: '这些抗体会先和哪里结合？',
    baseState: 'state-start',
    options: [
      { label: '红细胞表面的固定抗原', correct: true, state: 'state-bound' },
      { label: '血液中游离的抗原', correct: false, state: 'state-complex', errorTitle: '这条路径会形成免疫复合物', errorText: '游离抗原与抗体结合后，会形成可溶性免疫复合物，指向Ⅲ型超敏反应；Ⅱ型的抗体结合的是细胞表面的固定靶点。' },
    ],
  },
  {
    context: '抗体已经结合在红细胞表面的固定抗原上',
    title: '抗体贴住红细胞以后，接下来会怎样？',
    baseState: 'state-bound',
    options: [
      { label: '补体等参与并造成红细胞损伤', correct: true, state: 'state-damage' },
      { label: '形成复合物后随血流移动', correct: false, state: 'state-complex', errorTitle: '“随血流移动”不是本题路径', errorText: '可溶性复合物随血流移动属于Ⅲ型；这里的抗体已经固定在红细胞表面，随后招募补体等效应机制并造成细胞损伤。' },
    ],
  },
];

let currentQuestion = 0;
let locked = true;
let titleTimer;
let timers = [];

function later(callback, delay) {
  const timer = window.setTimeout(callback, delay);
  timers.push(timer);
}

function clearTimers() {
  timers.forEach(window.clearTimeout);
  timers = [];
  window.clearInterval(titleTimer);
}

function setPhase(phase) { lesson.dataset.phase = phase; }

function setDiagram(state, label) {
  diagram.className = `diagram ${state}`;
  if (label) diagram.setAttribute('aria-label', label);
}

function renderQuestion() {
  const question = questions[currentQuestion];
  explanation.hidden = true;
  summary.hidden = true;
  questionCore.hidden = false;
  questionCore.innerHTML = `
    <p class="question-meta">${currentQuestion + 1} / ${questions.length}</p>
    <p class="question-context">${question.context}</p>
    <h2>${question.title}</h2>
    <div class="options">
      ${question.options.map((option, index) => `
        <button class="option" type="button" data-option="${index}">
          <b>${String.fromCharCode(65 + index)}</b><span>${option.label}</span>
        </button>`).join('')}
    </div>`;
}

function focusQuestionAfterImage(delay = 1700) {
  locked = true;
  setPhase('visual');
  later(() => { setPhase('question'); locked = false; }, delay);
}

function showError(option) {
  explanation.hidden = false;
  explanation.innerHTML = `
    <p>回答错误</p><h2>${option.errorTitle}</h2>
    <div>${option.errorText}</div><small>看完解析后自动返回题目</small>`;
  setDiagram(option.state, option.errorTitle);
  setPhase('error');
  later(() => {
    const question = questions[currentQuestion];
    setDiagram(question.baseState, question.context);
    explanation.hidden = true;
    setPhase('question');
    locked = false;
  }, 3200);
}

function showSummary() {
  questionCore.hidden = true;
  explanation.hidden = true;
  summary.hidden = false;
  summary.innerHTML = `
    <p>本页考点</p><h2>固定靶点上的抗体造成细胞损伤</h2>
    <div>血型不合输血反应属于Ⅱ型超敏反应。游离抗原与抗体形成复合物并沉积，则属于Ⅲ型。</div>`;
  setPhase('summary');
}

function handleCorrect(option) {
  locked = true;
  setDiagram(option.state, option.label);
  setPhase('transition');
  later(() => {
    if (currentQuestion < questions.length - 1) {
      currentQuestion += 1;
      renderQuestion();
      setDiagram(questions[currentQuestion].baseState, questions[currentQuestion].context);
      focusQuestionAfterImage();
    } else {
      setPhase('visual');
      later(showSummary, 1500);
    }
  }, 620);
}

function startTitleSequence() {
  const text = title.dataset.title;
  title.textContent = '';
  title.classList.add('typing');
  let index = 0;
  titleTimer = window.setInterval(() => {
    index += 1;
    title.textContent = text.slice(0, index);
    if (index >= text.length) {
      window.clearInterval(titleTimer);
      title.classList.remove('typing');
      later(() => focusQuestionAfterImage(), 550);
    }
  }, 110);
}

questionCore.addEventListener('click', (event) => {
  const button = event.target.closest('.option');
  if (!button || locked) return;
  locked = true;
  const option = questions[currentQuestion].options[Number(button.dataset.option)];
  button.classList.add(option.correct ? 'correct' : 'wrong');
  option.correct ? handleCorrect(option) : showError(option);
});

openButton.addEventListener('click', () => {
  clearTimers();
  directory.hidden = true;
  lesson.hidden = false;
  currentQuestion = 0;
  locked = true;
  renderQuestion();
  setDiagram('state-start', questions[0].context);
  setPhase('title');
  startTitleSequence();
  window.scrollTo({ top: 0, behavior: 'auto' });
});

backButton.addEventListener('click', () => {
  clearTimers();
  lesson.hidden = true;
  directory.hidden = false;
  window.scrollTo({ top: 0, behavior: 'auto' });
});
