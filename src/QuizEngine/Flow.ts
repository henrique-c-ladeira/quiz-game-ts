type TAnswerCallback<Answer> = (answer: Answer) => void;

type BaseQuestion = {
  id: symbol;
};

export interface Router<Question extends BaseQuestion, Answer> {
  routeToQuestion: (
    question: Question,
    answerCallback: TAnswerCallback<Answer>
  ) => void;
  routeToResult: (result: Record<Question['id'], Answer>) => void;
}

export default class Flow<Question extends BaseQuestion, Answer> {
  constructor(
    readonly router: Router<Question, Answer>,
    readonly questions: Question[],
    private result: Record<Question['id'], Answer>
  ) {}

  public start() {
    const firstQuestion = this.questions[0];
    if (!firstQuestion) {
      return null;
    }

    this.router.routeToQuestion(firstQuestion, this.routeNext(firstQuestion));
  }

  private routeNext(question: Question): TAnswerCallback<Answer> {
    const currentQuestionIndex = this.questions.indexOf(question);
    const nextQuestionIndex = currentQuestionIndex + 1;
    const nextQuestion = this.questions[nextQuestionIndex];
    if (!nextQuestion) {
      return (answer) => {
        this.result = { ...this.result, [question.id]: answer };
        return this.router.routeToResult(this.result);
      };
    }

    return (answer) => {
      this.result = { ...this.result, [question.id]: answer };
      this.router.routeToQuestion(nextQuestion, this.routeNext(nextQuestion));
    };
  }
}
