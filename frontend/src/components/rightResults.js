import {UrlManager} from "../utils/url-manager";
import {Auth} from "../services/auth";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class RightResults {
    constructor() {
        this.routeParams = UrlManager.getQueryParams();

        this.init();
    }

    async init() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
        }

        if (this.routeParams.id) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/result/details?userId=' + userInfo.userId);

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }

                    document.getElementById('right-results-pre-title').innerHTML =
                        'Результат прохождения теста <img alt="Стрелка" src="images/small-arrow-white.png"></a> <span>'
                        + result.test.name
                        + '</span>';

                    document.getElementById('description').innerHTML =
                        'Тест выполнил <span>' + userInfo.fullName + ', ' + userInfo.userEmail + '</span>';

                    this.buildTestQuestionElements(result.test.questions);

                    const that = this;
                    document.getElementById('goto-result').onclick = function () {
                        location.href = '#/result?id=' + that.routeParams.id;
                    }
                    return;
                }
            } catch (error) {
                console.log(error)
            }
        }
        location.href = '#/';
    }


    buildTestQuestionElements(questions) {
        console.log("Функция отрисовки элементов");
        console.log(questions);

        // Создаем родитель для всех .test-question:
        const allQuestionsElement = document.getElementById('all-questions');

        let currentQuestionIndex = 0;
        questions.forEach(questionObj => {
            console.log(questionObj);
            // Создаем отдельный блок для каждого вопроса
            const testQuestion = document.createElement('div');
            testQuestion.className = 'test-question';
            allQuestionsElement.appendChild(testQuestion);

            // Создаем блок с текстом вопроса:
            const testQuestionTitleElement = document.createElement('div');
            testQuestionTitleElement.className = 'test-question-title';
            const questionText = questionObj.question;
            testQuestionTitleElement.innerHTML = '<span>Вопрос ' + (currentQuestionIndex + 1) +':</span> ' + questionText;
            testQuestion.appendChild(testQuestionTitleElement);

            // Создаем родитель для всех вариантов ответа:
            const testQuestionOptionsElement = document.createElement('div');
            testQuestionOptionsElement.className = 'test-question-options';
            testQuestion.appendChild(testQuestionOptionsElement);

            // Проходим по текстам вариантов каждого вопроса, создавая элементы под них:
            questionObj.answers.forEach(option => {
                // Создаем .test-question-option:
                const testQuestionOptionElement = document.createElement('div');
                testQuestionOptionElement.className = 'test-question-option';
                if ('correct' in option) {
                    testQuestionOptionElement.setAttribute('data-correct',"true")
                    if (!option.correct) {
                        testQuestionOptionElement.setAttribute('data-correct',"false")
                    }
                }

                // Создаем внутренние элементы .test-question-option:
                const roundElement = document.createElement('div');
                roundElement.className = 'round';
                testQuestionOptionElement.appendChild(roundElement);

                const labelElement = document.createElement('div');
                labelElement.className = 'label';
                labelElement.innerHTML = option.answer;
                testQuestionOptionElement.appendChild(labelElement);

                testQuestionOptionsElement.appendChild(testQuestionOptionElement);
            });

            currentQuestionIndex++;
        });

    }
}