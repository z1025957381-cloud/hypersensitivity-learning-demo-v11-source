const directory = document.querySelector('#directory');
const lesson = document.querySelector('#lesson');
const openButton = document.querySelector('#open-type2');
const backButton = document.querySelector('#back-directory');
const title = document.querySelector('#lesson-title');
const imageFrame = document.querySelector('#image-frame');
const diagram = document.querySelector('#mechanism-diagram');
const caption = document.querySelector('#image-caption');
const keypoint = document.querySelector('#keypoint');
const questionArea = document.querySelector('#question-area');

const questions = [
  {
    title: '这些抗体会先和哪里结合？',
    options: [
      {
        label: '红细胞表面的固定抗原',
        correct: true,
        state: 'state-bound',
        alt: '抗体已经结合在红细胞表面的固定抗原上',
        caption: '抗体结合红细胞表面的固定抗原',
        keypoint: '考点：抗体结合细胞表面的固定抗原 → Ⅱ型超敏反应',
        feedback: '抗体已经找到并结合固定在红细胞表面的靶点。',
      },
      {
        label: '血液中游离的抗原',
        correct: false,
        state: 'state-complex',
        alt: '游离抗原与抗体形成免疫复合物',
        caption: '游离抗原与抗体形成复合物',
        keypoint: '错误路径：游离抗原与抗体形成复合物 → Ⅲ型',
        feedback: '这会形成可溶性免疫复合物，指向Ⅲ型；Ⅱ型的抗体结合的是细胞表面的固定抗原。',
      },
    ],
  },
  {
    title: '抗体贴住红细胞以后，接下来会怎样？',
    options: [
      {
        label: '补体等参与并造成红细胞损伤',
        correct: true,
        state: 'state-damage',
        alt: '补体等参与并造成红细胞损伤',
        caption: '补体等参与，红细胞受损',
        keypoint: '考点：固定靶点上的抗体招募补体等效应机制，造成细胞损伤 → Ⅱ型',
        feedback: '抗体结合固定靶点后，补体等效应机制参与并造成细胞损伤。',
      },
      {
        label: '形成复合物后随血流移动',
        correct: false,
        state: 'state-complex',
        alt: '免疫复合物在血液中形成并移动',
        caption: '可溶性免疫复合物随血流移动',
        keypoint: '错误路径：可溶性免疫复合物随血流移动 → Ⅲ型',
        feedback: '形成可溶性复合物并随血流移动属于Ⅲ型路径；本题中的抗体已经贴在红细胞表面。',
      },
    ],
  },
];

let currentQuestion = 0;
let locked = false;
let titleTimer;

function typeTitle() {
  window.clearInterval(titleTimer);
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
    }
  }, 90);
}

async function changeImage(state, emphasize = false) {
  imageFrame.classList.add('switching');
  await new Promise((resolve) => window.setTimeout(resolve, 420));
  diagram.className = `diagram ${state.state}`;
  diagram.setAttribute('aria-label', state.alt);
  caption.textContent = state.caption;
  imageFrame.classList.remove('switching', 'emphasis');
  if (emphasize) {
    void imageFrame.offsetWidth;
    imageFrame.classList.add('emphasis');
  }
}

function showKeypoint(text, wrong) {
  keypoint.hidden = false;
  keypoint.textContent = text;
  keypoint.className = `keypoint${wrong ? ' wrong' : ''}`;
}

function renderQuestion() {
  locked = false;
  keypoint.hidden = true;
  const question = questions[currentQuestion];
  questionArea.className = 'question-area';
  questionArea.innerHTML = `
    <p class="question-meta">${currentQuestion + 1} / ${questions.length}</p>
    <h2>${question.title}</h2>
    <div class="options">
      ${question.options.map((option, index) => `
        <button class="option" type="button" data-option="${index}">
          <b>${String.fromCharCode(65 + index)}</b>${option.label}
        </button>
      `).join('')}
    </div>
    <p class="feedback" id="feedback" hidden></p>
  `;
}

function renderSummary() {
  questionArea.className = 'question-area summary';
  questionArea.innerHTML = `
    <p class="question-meta">本页考点</p>
    <h2>固定靶点上的抗体造成细胞损伤</h2>
    <p>血型不合输血反应属于Ⅱ型超敏反应。</p>
    <p>辨析：游离抗原与抗体形成复合物并沉积，属于Ⅲ型。</p>
  `;
}

questionArea.addEventListener('click', async (event) => {
  const button = event.target.closest('.option');
  if (!button || locked) return;
  locked = true;

  const question = questions[currentQuestion];
  const selected = question.options[Number(button.dataset.option)];
  const feedback = questionArea.querySelector('#feedback');
  button.classList.add(selected.correct ? 'correct' : 'wrong');
  button.disabled = true;

  await changeImage(selected, selected.correct);
  showKeypoint(selected.keypoint, !selected.correct);
  feedback.hidden = false;
  feedback.className = `feedback${selected.correct ? '' : ' wrong'}`;
  feedback.textContent = selected.feedback;

  if (!selected.correct) {
    locked = false;
    return;
  }

  questionArea.querySelectorAll('.option').forEach((option) => { option.disabled = true; });
  window.setTimeout(() => {
    if (currentQuestion < questions.length - 1) {
      currentQuestion += 1;
      renderQuestion();
    } else {
      renderSummary();
    }
  }, 2200);
});

openButton.addEventListener('click', () => {
  directory.hidden = true;
  lesson.hidden = false;
  currentQuestion = 0;
  diagram.className = 'diagram state-start';
  diagram.setAttribute('aria-label', '抗体正在接近红细胞表面的抗原');
  caption.textContent = '抗体正在寻找红细胞表面的固定抗原';
  renderQuestion();
  typeTitle();
  window.scrollTo({ top: 0, behavior: 'auto' });
});

backButton.addEventListener('click', () => {
  window.clearInterval(titleTimer);
  lesson.hidden = true;
  directory.hidden = false;
  window.scrollTo({ top: 0, behavior: 'auto' });
});
