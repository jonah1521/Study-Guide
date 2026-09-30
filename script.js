const notesEl = document.getElementById("notes");

const generateBtn = document.getElementById("generateBtn");

const results = document.getElementById("results");

const emptyState = document.getElementById("emptyState");

const guideEl = document.getElementById("guide");

const flashcardsEl = document.getElementById("flashcards");

const quizEl = document.getElementById("quiz");

const scoreEl = document.getElementById("score");

const submitQuizBtn =
  document.getElementById("submitQuizBtn");

const newQuizBtn =
  document.getElementById("newQuizBtn");


let currentQuiz = [];


/* -----------------------------
   Clean text
----------------------------- */

function cleanText(text) {

  return text
    .replace(/\s+/g, " ")
    .trim();

}


/* -----------------------------
   Split notes into sentences
----------------------------- */

function splitSentences(text) {

  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(cleanText)
    .filter(sentence => sentence.length > 25);

}


/* -----------------------------
   Create a title
----------------------------- */

function titleFromSentence(sentence) {

  const words = sentence
    .replace(/[.,!?;:()]/g, "")
    .split(" ");

  return words
    .slice(0, Math.min(7, words.length))
    .join(" ");

}


/* -----------------------------
   Create Study Guide
----------------------------- */

function makeStudyGuide(notes) {

  const sentences = splitSentences(notes);

  if (!sentences.length) {

    guideEl.innerHTML = `
      <p>
        Add a few complete sentences so StudyBuddy
        can organize your material.
      </p>
    `;

    return;
  }


  const topics = [];


  for (let i = 0; i < sentences.length; i += 3) {

    const group = sentences.slice(i, i + 3);

    topics.push({

      title:
        `Topic ${topics.length + 1}: ${titleFromSentence(group[0])}`,

      points: group

    });

  }


  guideEl.innerHTML = topics
    .map(topic => {

      return `
        <div class="topic">

          <h3>
            ${escapeHtml(topic.title)}
          </h3>

          ${topic.points
            .map(point => {

              return `
                <p>
                  • ${escapeHtml(point)}
                </p>
              `;

            })
            .join("")}

        </div>
      `;

    })
    .join("");

}


/* -----------------------------
   Create Flashcards
----------------------------- */

function makeFlashcards(notes) {

  const sentences =
    splitSentences(notes).slice(0, 12);


  if (!sentences.length) {

    flashcardsEl.innerHTML =
      "<p>Not enough material for flashcards.</p>";

    return;
  }


  flashcardsEl.innerHTML = sentences
    .map((sentence, i) => {

      const words = sentence.split(" ");

      const subject =
        words
          .slice(0, Math.min(5, words.length))
          .join(" ");


      return `

        <div
          class="flashcard"
          onclick="this.classList.toggle('revealed')"
        >

          <strong>
            Card ${i + 1}
          </strong>

          <p>
            What is important about:
            <b>${escapeHtml(subject)}...</b>?
          </p>

          <div class="answer">

            ${escapeHtml(sentence)}

          </div>

          <small>
            Tap to reveal answer
          </small>

        </div>

      `;

    })
    .join("");

}


/* -----------------------------
   Create Quiz
----------------------------- */

function makeQuiz(notes) {

  const sentences =
    splitSentences(notes);


  currentQuiz =
    sentences
      .slice(0, 5)
      .map((sentence, index) => {

        const words =
          sentence
            .split(" ")
            .filter(word => word.length > 5);


        const answer =
          words[0] ||
          sentence.split(" ")[0];


        const masked =
          sentence.replace(
            new RegExp(
              `\\b${escapeRegex(answer)}\\b`,
              "i"
            ),
            "_____"
          );


        const wrong = [

          "This information is unrelated.",

          "This happens only in a different process."

        ];


        return {

          index,

          sentence,

          answer,

          masked,

          wrong

        };

      });


  if (!currentQuiz.length) {

    quizEl.innerHTML =
      "<p>Not enough material for a quiz.</p>";

    return;

  }


  quizEl.innerHTML =
    currentQuiz
      .map((question, i) => {

        return `

          <div class="question">

            <strong>
              ${i + 1}. Complete the statement:
            </strong>

            <p>
              ${escapeHtml(question.masked)}
            </p>


            <label>

              <input
                type="radio"
                name="q${i}"
                value="${escapeHtml(question.answer)}"
              >

              ${escapeHtml(question.answer)}

            </label>


            <label>

              <input
                type="radio"
                name="q${i}"
                value="${escapeHtml(question.wrong[0])}"
              >

              ${escapeHtml(question.wrong[0])}

            </label>


            <label>

              <input
                type="radio"
                name="q${i}"
                value="${escapeHtml(question.wrong[1])}"
              >

              ${escapeHtml(question.wrong[1])}

            </label>

          </div>

        `;

      })
      .join("");


  scoreEl.textContent = "";

}


/* -----------------------------
   Check Quiz
----------------------------- */

function submitQuiz() {

  let correct = 0;


  currentQuiz.forEach((question, i) => {

    const selected =
      document.querySelector(
        `input[name="q${i}"]:checked`
      );


    if (
      selected &&
      selected.value.toLowerCase() ===
      question.answer.toLowerCase()
    ) {

      correct++;

    }

  });


  scoreEl.textContent =
    `Score: ${correct}/${currentQuiz.length}`;

}


/* -----------------------------
   Escape HTML
----------------------------- */

function escapeHtml(value) {

  return value.replace(
    /[&<>"']/g,

    character => ({

      "&": "&amp;",

      "<": "&lt;",

      ">": "&gt;",

      '"': "&quot;",

      "'": "&#039;"

    }[character])

  );

}


/* -----------------------------
   Escape Regex
----------------------------- */

function escapeRegex(value) {

  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

}


/* -----------------------------
   Generate everything
----------------------------- */

generateBtn.addEventListener(
  "click",
  () => {

    const notes =
      cleanText(notesEl.value);


    if (notes.length < 30) {

      alert(
        "Please paste at least a few sentences of study material."
      );

      return;

    }


    makeStudyGuide(notes);

    makeFlashcards(notes);

    makeQuiz(notes);


    emptyState.classList.add("hidden");

    results.classList.remove("hidden");


    results.scrollIntoView({
      behavior: "smooth"
    });

  }
);


/* -----------------------------
   Submit Quiz
----------------------------- */

submitQuizBtn.addEventListener(
  "click",
  submitQuiz
);


/* -----------------------------
   New Quiz
----------------------------- */

newQuizBtn.addEventListener(
  "click",
  () => {

    makeQuiz(
      cleanText(notesEl.value)
    );

  }
);
