/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import Flow, { Router } from '../Flow';

describe('Flow tests', () => {
  type Question = {
    id: symbol;
    value: string;
  };

  type Answer = string;

  class RouterSpy implements Router<Question, Answer> {
    routedQuestions: Question[] = [];
    routedResult = {};
    answerCallback = (_: Answer) => {};

    routeToQuestion = (
      question: Question,
      answerCallback: (answer: Answer) => void
    ) => {
      this.routedQuestions.push(question);
      this.answerCallback = answerCallback;
    };

    routeToResult = (result: Record<Question['id'], Answer>) => {
      this.routedResult = result;
    };
  }

  const makeSUT = (questions: Answer[]) => {
    const router = new RouterSpy();
    const mappedQuestions = questions.map((question) => ({
      id: Symbol(question),
      value: question,
    }));
    const sut = new Flow<Question, Answer>(router, mappedQuestions, {});
    return { sut, router, mappedQuestions };
  };

  it('should routes to no question if started with no questions', () => {
    const { sut, router } = makeSUT([]);
    sut.start();

    expect(router.routedQuestions).toEqual([]);
  });

  it('should route to correct question if started with one question', () => {
    const { sut, router, mappedQuestions } = makeSUT(['Q1']);
    sut.start();

    expect(router.routedQuestions).toEqual(mappedQuestions);
  });

  it('should route to correct question if started with one question Q2', () => {
    const { sut, router, mappedQuestions } = makeSUT(['Q2']);
    sut.start();

    expect(router.routedQuestions).toEqual(mappedQuestions);
  });

  it('should route to first question if started with two questions', () => {
    const { sut, router, mappedQuestions } = makeSUT(['Q1', 'Q2']);
    sut.start();

    expect(router.routedQuestions).toEqual([mappedQuestions[0]]);
  });

  it('should route twice to first question if started twice with two questions', () => {
    const { sut, router, mappedQuestions } = makeSUT(['Q1', 'Q2']);
    sut.start();
    sut.start();

    expect(router.routedQuestions).toEqual([
      mappedQuestions[0],
      mappedQuestions[0],
    ]);
  });

  it('should route to second question if started and answered first question', () => {
    const { sut, router, mappedQuestions } = makeSUT(['Q1', 'Q2']);
    sut.start();

    router.answerCallback('A1');

    expect(router.routedQuestions).toEqual(mappedQuestions);
  });

  it('should route to third question if started and answered first and second question', () => {
    const { sut, router, mappedQuestions } = makeSUT(['Q1', 'Q2', 'Q3']);
    sut.start();

    router.answerCallback('A1');
    router.answerCallback('A2');

    expect(router.routedQuestions).toEqual(mappedQuestions);
  });

  it('should not route to another question if started and answered first question with only one question', () => {
    const { sut, router, mappedQuestions } = makeSUT(['Q1']);
    sut.start();

    router.answerCallback('A1');

    expect(router.routedQuestions).toEqual(mappedQuestions);
  });

  it('should route to result if started with no questions', () => {
    const { sut, router } = makeSUT([]);
    sut.start();

    expect(router.routedResult).toEqual({});
  });

  it('should route to result if started and answered first question with only one question', () => {
    const { sut, router, mappedQuestions } = makeSUT(['Q1']);
    sut.start();

    router.answerCallback('A1');

    expect(router.routedResult).toEqual({ [mappedQuestions[0].id]: 'A1' });
  });

  it('should route to result if started and answered first 02 questions with 02 question', () => {
    const { sut, router, mappedQuestions } = makeSUT(['Q1', 'Q2']);
    sut.start();

    router.answerCallback('A1');
    router.answerCallback('A2');

    expect(router.routedResult).toEqual({
      [mappedQuestions[0].id]: 'A1',
      [mappedQuestions[1].id]: 'A2',
    });
  });

  it('should not route to result if started and answered first question with 02 question', () => {
    const { sut, router } = makeSUT(['Q1', 'Q2']);
    sut.start();

    router.answerCallback('A1');

    expect(router.routedResult).toEqual({});
  });
});
