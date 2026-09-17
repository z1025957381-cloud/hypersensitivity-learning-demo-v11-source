const course = document.querySelector('#course');
const lessons = [...document.querySelectorAll('.lesson')];
const dots = [...document.querySelectorAll('.rail-dot')];
const GUIDE_ADVANCE_DELAY = 540;
const FOCUS_CONFIRM_DELAY = 320;
const FOCUS_VISUAL_DELAY = 900;
const FOCUS_INTRO_DELAY = 1000;
const PROTOTYPE_ADVANCE_DELAY = 1800;

function showAnswerMessage(question, message, type) {
  let status = question.querySelector('.answer-message');
  if (!status) {
    status = document.createElement('p');
    status.className = 'answer-message';
    status.setAttribute('role', 'alert');
    status.setAttribute('aria-live', 'assertive');
    question.append(status);
  }

  status.className = `answer-message is-${type}`;
  status.textContent = message;
  status.removeAttribute('aria-hidden');
}

function markAnswer(lesson, option) {
  if (lesson.classList.contains('answered')) return;

  const answer = Number(lesson.dataset.answer);
  const selected = Number(option.dataset.option);
  const options = [...lesson.querySelectorAll('.option')];
  const question = option.closest('.question-block');

  if (selected !== answer) {
    option.classList.add('is-wrong');
    option.disabled = true;
    option.setAttribute('aria-disabled', 'true');
    showAnswerMessage(question, option.dataset.feedback || '回答错误，请结合机制再试一次。', 'wrong');
    return;
  }

  lesson.classList.add('answered');
  option.classList.add('is-correct');
  options.forEach((item) => {
    item.disabled = true;
    item.setAttribute('aria-disabled', 'true');
  });
  showAnswerMessage(question, '回答正确。', 'correct');

  const dot = dots.find((item) => item.dataset.target === lesson.id);
  dot?.classList.add('completed');
}

function advanceFocusedGuide(lesson, question, step) {
  const stableScrollTop = course.scrollTop;
  window.setTimeout(() => {
    lesson.classList.add(`guide-stage-${step}`, 'focus-transitioning');

    window.setTimeout(() => {
      question.hidden = true;

      if (step === 1) {
        const nextQuestion = lesson.querySelector('[data-guide-step="2"]');
        if (nextQuestion) nextQuestion.hidden = false;
      } else {
        const feedback = lesson.querySelector('.guide-feedback');
        if (feedback) feedback.hidden = false;
      }

      window.requestAnimationFrame(() => {
        course.scrollTop = stableScrollTop;
        lesson.classList.remove('focus-transitioning');
        if (step === 2) {
          lesson.classList.add('answered');
          const dot = dots.find((item) => item.dataset.target === lesson.id);
          dot?.classList.add('completed');
        }
        window.requestAnimationFrame(() => {
          course.scrollTop = stableScrollTop;
        });
      });
    }, FOCUS_VISUAL_DELAY);
  }, FOCUS_CONFIRM_DELAY);
}

function showPrototypeWrongVisual(lesson, option) {
  lesson.classList.add('prototype-wrong');
  const keypoint = lesson.querySelector('.focus-keypoint');
  if (keypoint) {
    keypoint.textContent = option.dataset.visualFeedback || '错误路径：游离抗原与抗体形成复合物 → Ⅲ型';
    keypoint.classList.add('is-visible', 'is-wrong');
  }
}

function advancePrototypeGuide(lesson, question, step) {
  lesson.classList.remove('prototype-wrong');
  lesson.classList.add(`guide-stage-${step}`);

  const keypoint = lesson.querySelector('.focus-keypoint');
  if (keypoint) {
    keypoint.textContent = question.dataset.keypoint || '';
    keypoint.classList.add('is-visible');
    keypoint.classList.remove('is-wrong');
  }

  window.setTimeout(() => {
    question.hidden = true;
    if (step === 1) {
      const nextQuestion = lesson.querySelector('[data-guide-step="2"]');
      if (nextQuestion) nextQuestion.hidden = false;
      return;
    }

    const feedback = lesson.querySelector('.guide-feedback');
    if (feedback) feedback.hidden = false;
    lesson.classList.add('answered');
  }, PROTOTYPE_ADVANCE_DELAY);
}

function typeLessonTitle(lesson) {
  if (lesson.classList.contains('title-typed')) return;
  const title = lesson.querySelector('.lesson-head h1, .lesson-head h2');
  if (!title) return;

  lesson.classList.add('title-typed', 'title-typing');
  const content = title.textContent.trim();
  title.textContent = '';
  let index = 0;
  const timer = window.setInterval(() => {
    index += 1;
    title.textContent = content.slice(0, index);
    if (index >= content.length) {
      window.clearInterval(timer);
      lesson.classList.remove('title-typing');
    }
  }, 85);
}

function markGuidedAnswer(lesson, option) {
  const question = option.closest('.guide-question');
  if (!question || question.classList.contains('resolved')) return;

  const answer = Number(question.dataset.answer);
  const selected = Number(option.dataset.option);
  const options = [...question.querySelectorAll('.option')];
  const step = Number(question.dataset.guideStep);

  if (selected !== answer) {
    option.classList.add('is-wrong');
    option.disabled = true;
    option.setAttribute('aria-disabled', 'true');
    showAnswerMessage(question, option.dataset.feedback || '回答错误，请结合机制再试一次。', 'wrong');
    if (lesson.classList.contains('prototype-v2')) showPrototypeWrongVisual(lesson, option);
    return;
  }

  question.classList.add('resolved');
  option.classList.add('is-correct');
  options.forEach((item) => {
    item.disabled = true;
    item.setAttribute('aria-disabled', 'true');
  });
  showAnswerMessage(question, '回答正确。', 'correct');

  if (lesson.classList.contains('prototype-v2')) {
    option.blur();
    advancePrototypeGuide(lesson, question, step);
    return;
  }

  if (lesson.classList.contains('focus-layout')) {
    option.blur();
    advanceFocusedGuide(lesson, question, step);
    return;
  }

  if (step === 1) {
    lesson.classList.add('guide-stage-1');
    window.setTimeout(() => {
      question.hidden = true;
      const nextQuestion = lesson.querySelector('[data-guide-step="2"]');
      if (nextQuestion) nextQuestion.hidden = false;
    }, GUIDE_ADVANCE_DELAY);
    return;
  }

  lesson.classList.add('guide-stage-2');
  window.setTimeout(() => {
    question.hidden = true;
    const feedback = lesson.querySelector('.guide-feedback');
    if (feedback) feedback.hidden = false;
    window.requestAnimationFrame(() => {
      lesson.classList.add('answered');
      const dot = dots.find((item) => item.dataset.target === lesson.id);
      dot?.classList.add('completed');
    });
  }, GUIDE_ADVANCE_DELAY);
}

course.addEventListener('click', (event) => {
  const option = event.target.closest('.option');
  if (option) {
    const lesson = option.closest('.lesson');
    if (lesson.dataset.guided === 'true') markGuidedAnswer(lesson, option);
    else markAnswer(lesson, option);
    return;
  }

  const dot = event.target.closest('.rail-dot');
  if (dot) {
    document.getElementById(dot.dataset.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

const observer = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!visible) return;
  lessons.forEach((lesson) => lesson.classList.toggle('is-current', lesson === visible.target));
  if (
    visible.target.classList.contains('focus-layout') &&
    !visible.target.classList.contains('prototype-v2') &&
    !visible.target.classList.contains('focus-introduced') &&
    !visible.target.classList.contains('focus-intro')
  ) {
    visible.target.classList.add('focus-intro');
    window.setTimeout(() => {
      visible.target.classList.remove('focus-intro');
      visible.target.classList.add('focus-introduced');
    }, FOCUS_INTRO_DELAY);
  }
  if (visible.target.classList.contains('prototype-v2')) typeLessonTitle(visible.target);
  const progressTarget = visible.target.dataset.progressTarget || visible.target.id;
  dots.forEach((dot) => {
    const isCurrent = dot.dataset.target === progressTarget;
    dot.classList.toggle('current', isCurrent);
    if (isCurrent) dot.setAttribute('aria-current', 'step');
    else dot.removeAttribute('aria-current');
  });
}, { root: course, threshold: [.52, .72] });

lessons.forEach((lesson) => observer.observe(lesson));
