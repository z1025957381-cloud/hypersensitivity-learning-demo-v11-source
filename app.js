const course = document.querySelector('#course');
const lessons = [...document.querySelectorAll('.lesson')];
const dots = [...document.querySelectorAll('.rail-dot')];
const GUIDE_ADVANCE_DELAY = 540;

function markAnswer(lesson, option) {
  if (lesson.classList.contains('answered')) return;

  const answer = Number(lesson.dataset.answer);
  const selected = Number(option.dataset.option);
  const options = [...lesson.querySelectorAll('.option')];

  lesson.classList.add('answered');
  option.classList.add(selected === answer ? 'is-correct' : 'is-wrong');
  options.find((item) => Number(item.dataset.option) === answer)?.classList.add('is-correct');
  options.forEach((item) => item.setAttribute('aria-disabled', 'true'));

  const dot = dots.find((item) => item.dataset.target === lesson.id);
  dot?.classList.add('completed');
}

function markGuidedAnswer(lesson, option) {
  const question = option.closest('.guide-question');
  if (!question || question.classList.contains('resolved')) return;

  const answer = Number(question.dataset.answer);
  const selected = Number(option.dataset.option);
  const options = [...question.querySelectorAll('.option')];
  const step = Number(question.dataset.guideStep);

  question.classList.add('resolved');
  option.classList.add(selected === answer ? 'is-correct' : 'is-wrong');
  options.find((item) => Number(item.dataset.option) === answer)?.classList.add('is-correct');
  options.forEach((item) => {
    item.disabled = true;
    item.setAttribute('aria-disabled', 'true');
  });

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
  const progressTarget = visible.target.dataset.progressTarget || visible.target.id;
  dots.forEach((dot) => {
    const isCurrent = dot.dataset.target === progressTarget;
    dot.classList.toggle('current', isCurrent);
    if (isCurrent) dot.setAttribute('aria-current', 'step');
    else dot.removeAttribute('aria-current');
  });
}, { root: course, threshold: [.52, .72] });

lessons.forEach((lesson) => observer.observe(lesson));
