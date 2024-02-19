import React, {useState, useEffect, useRef, useLayoutEffect} from 'react';
import {Link, useParams, useNavigate, Navigate} from 'react-router-dom';

import './QuizPage.css';
import 'bootstrap/dist/css/bootstrap.css';
// import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import './style.css';

import AceEditor from 'react-ace';
import DOMPurify from 'dompurify';
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-chrome";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/snippets/golang";
import "ace-builds/src-noconflict/snippets/python";

import QuestionList from "./QuestionList";
import TopicList from "./TopicList";
import HamburgerMenu from "./HamburgerMenu";
import {getElement} from "bootstrap/js/src/util";
import alert from "bootstrap/js/src/alert";
import Registration from "./Registration";
import Login from "./Login";
import * as PropTypes from "prop-types";
import Result from "./Result";
import "./Result.css";

const QuizPage = (props) => {

    const [questions, setQuestions] = useState([]);
    const [topic, setTopic] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [explanation, setExplanation] = useState('');
    const [code, setCode] = useState('');
    //const [output, setOutput] = useState('');
    const [changeCode, setChangeCode] = useState(false)
    const [setNotCode, setSetNotCode] = useState(false)
    //const [prevQuestion, setPrevQuestion] = useState("")
    const [runDisabled, setRunDisabled] = useState(true)
    const navigate = useNavigate();
    const [selectedMode, setSelectedMode] = useState(''); // Default mode is 'light'
    const [language, setLanguage] = useState({"id":1,"name":"Go","logo":"Go-Logo_Blue.png","width":73});
    const [token, setToken] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [languages, setLanguages] = useState([])
    const [user, setUser] = useState(null)
    const toggleModal = () => {
        setShowModal(!showModal);
    };

    let prevCode = ''
    const ref = useRef(null);
    //const [itemMode, setItemMode] = useState([]);


    useLayoutEffect(() => {
        ref.current.style.setProperty('margin', '10px', 'important');

    }, []);
    useEffect(() => {
        const mode = (localStorage.getItem('mode'));

        if (mode) {

            setSelectedMode(mode)

        } else {
            setSelectedMode('light')
        }
    }, [selectedMode]);

    let {questionId} = useParams();

    useEffect(() => {

        if (questionId == undefined) questionId = 0;
        if (questionId !== "" && questionId !== null) {
            questionId = parseInt(questionId, 10)
            if (questionId == 0)
                questionId = 1
            setCurrentQuestionIndex(questionId - 1);
        }
        // Fetch questions from the backend API

        fetchQuestions(language.id);

        async function fetchLanguages(){
            try {
                const response = await fetch('http://localhost:5000/api/languages'); // Replace with your backend API endpoint
                setLanguages(await response.json());
            } catch (error) {
                console.error('Error fetching languages:', error);
            }

        }
        fetchLanguages();

    }, []);


    const setUserToken = (userToken) => {
        console.error(userToken)
        setToken(userToken)
        localStorage.setItem('token', JSON.stringify(userToken));
        navigate(`/question/1`, {replace: true});
    }

    const  getUserToken = () => {
        const tokenString = localStorage.getItem('token');
        const userToken = JSON.parse(tokenString);
        setToken(userToken)
        return userToken?.userToken ?? ""
    }
    const  getUser = () => {
        setUser(localStorage.getItem('user'))
    }

    const logOut = () => {
        localStorage.removeItem('token')
        setToken(null)
    }
    const fetchQuestions = async (language) => {
        // if (questions.length !== 0)
        //     return;

        try {
            const response = await fetch('http://localhost:5000/api/questions/' + language.id +'/'+ getUserToken() ?? ''); // Replace with your backend API endpoint

            let data = await response.json();
            setQuestions(data.questions);
            setCurrentQuestionIndex(data.questionId - 1);
            setLanguage(data.language)

        } catch (error) {
            console.error(error)
        }
    };

    const jsonEscape = str => {
        return str.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
    }
    const fetchExplanation = async (question) => {
        try {
            let tureAnswer = ""
            switch (question.answer) {
                case 'a': tureAnswer = question.choice_a; break;
                case 'b': tureAnswer = question.choice_b; break;
                case 'c': tureAnswer = question.choice_c; break;
                case 'd': tureAnswer = question.choice_d; break;
            }

            const response = await fetch('http://localhost:5000/api/generate-explanation/',
            {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({question: question.question + ": " + jsonEscape(question.question_code.String), answer: tureAnswer, currentExplanation: question.explanation.String})
            });

            let data = await response.json();
            setExplanation("\n" + data.explanation)

        } catch (error) {
            console.error(error)
        }
    };

    const QuestionDetail = ({question}) => {
        // ... (render the question using the provided data)
    };

    const handleNextQuestion = () => {
        setChangeCode(true)
        setSetNotCode(false)
        setRunDisabled(true)
        // Reset the selected choice and explanation
        setSelectedChoice(null);
        setShowExplanation(false);
        setExplanation('')
        clearOutput()
        setCode("")
        // Move to the next question if available
        if (currentQuestionIndex < questions[questions.length - 1].id) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            questionId = currentQuestionIndex + 1
            navigate(`/question/${questionId + 1}`, {replace: true}); // Use replace: true to replace the current entry in the history

        }

    };

    const handlePreviousQuestion = () => {
        setChangeCode(true)
        setSetNotCode(false)
        setRunDisabled(true)
        setSelectedChoice(null);
        setShowExplanation(false);
        setExplanation('')
        clearOutput()
        // Move to the previous question if available
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            questionId = currentQuestionIndex
            navigate(`/question/${questionId}`, {replace: true}); // Use replace: true to replace the current entry in the history
        }
    };

    const storeUserQuestion = async (questionId, answer, choice) => {

        const loginToken =  token?.userToken || getUserToken() || ""
        const languageId = language.id ?? 1;
        questionId++
        try {
            const response = await fetch(`http://localhost:5000/api/userQuestions/${loginToken}/${languageId}/${questionId}/${answer}/${choice}`);
            const data = await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleChoiceSelect = (choice) => {
        setRunDisabled(false)
        // Save the selected choice
        setSelectedChoice(choice);
        if (isChoiceCorrect(choice)) {
            setShowExplanation(true);
            storeUserQuestion(currentQuestionIndex, true, choice)
            const currentQuestion = questions[currentQuestionIndex]
            if(currentQuestion.code.String.trim() !== "") {
                setCode(currentQuestion.code.String)
                setSetNotCode(true)
            }
        } else {
            storeUserQuestion(currentQuestionIndex, false, choice)
        }
    };

    const isChoiceCorrect = (choice) => {
        const currentQuestion = questions[currentQuestionIndex];
        return currentQuestion.answer === choice;
    };

    const clearOutput = () => {
        const cmdOutput = document.getElementById('output');
        cmdOutput.innerHTML = "";
    }

    const RunClick = () => { // add prevCode and prevResult to run only the prev result
        const cmdOutput = document.getElementById('output');
        cmdOutput.innerHTML = "";
        const Code = code;

        if (Code == undefined || Code.trim() =="") {
            return
        }
        showLoader();
        fetch('http://localhost:5000/api/run', {
            method: 'POST',
            body: JSON.stringify({code: Code, language_id: language.id})
        })
            .then(response => {
                if (response.status !== 200) {
                    return response.text().then(errorJSON => {
                        let errors = JSON.parse(errorJSON).errors
                        for (let error of errors) {
                            if (error !== "") {
                                cmdOutput.innerHTML += (error + "\n")
                            }
                        }
                    })
                }
                return response.text()
            })
            .then(outputValue => {
                hideLoader();
                if (outputValue == undefined) {
                    return;
                }

                const result = JSON.parse(outputValue);
                printLines(result.output, result.errors)
                setSetNotCode(true)
                setCode(result.formattedCode)
                setSetNotCode(true)

            })
            .catch(error => {
                hideLoader();
                cmdOutput.innerHTML = "Error running code: " + error
            });
    };

    function showLoader() {
        document.getElementById('loader').classList.remove('hidden');
    }

    function hideLoader() {
        document.getElementById('loader').classList.add('hidden');
    }

    function shareCode() {
        // Get the code from the textarea
        const codeTextarea = document.getElementById("codeTextarea");
        const code = codeTextarea.value;

        // Your code for copying to clipboard
        // ...

        // Notify the user that the code has been copied
        alert("Code copied to clipboard!");
    }

    function shareOnLinkedIn() {
        //  const code = editor.getValue();

        // Create the LinkedIn sharing URL with the code as the pre-filled message
        // const linkedInShareURL = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=Check out this code snippet&summary=${encodeURIComponent(code)}`;

        // Open the sharing URL in a new window
        // window.open(linkedInShareURL, "_blank");
    }

    function shareOnTwitter() {
        //  const code = editor.getValue();

        // Create the Twitter sharing URL with the code as the pre-filled message
        // const twitterShareURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(code)}&hashtags=codeSnippet`;

        // // Open the sharing URL in a new window
        // window.open(twitterShareURL, "_blank");
    }

    /*const handleChangeTextarea = (event) => {
        setOutput(event.target.value);
    };*/


    const printLines = (output, errorOutput) => {
        const cmdOutput = document.getElementById('output');

        for (let index = 0; index < output.length; index+=100) {
            setTimeout(() => {
                cmdOutput.innerHTML += output.slice(index, index + 100).join("\n") + "\n";
                cmdOutput.scrollTop = cmdOutput.scrollHeight;

            }, (1));
        }

        for (let index = 0; index < errorOutput.length; index++) {
            setTimeout(() => {
                cmdOutput.innerHTML += '<div class="error-line">' + errorOutput[index] + "</div>\n";
                cmdOutput.scrollTop = cmdOutput.scrollHeight;
            }, (1));
        }
    }

    function shareOnFacebook() {
        // const code = editor.getValue();

        // // Create the Facebook sharing URL with the code as the pre-filled message
        // const facebookShareURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(code)}`;

        // // Open the sharing URL in a new window
        // window.open(facebookShareURL, "_blank");
    }

    function shareOnInstagram() {
        // const code = editor.getValue();

        // // You cannot directly share text on Instagram via URL,
        // // so you may display a message or open the Instagram app with the code in the caption.
        // alert("To share on Instagram, open the Instagram app and create a new post with the code in the caption.");
    }

    const onChangeCode = (newCode) => {


        setSetNotCode(true)
        prevCode = code
        //
        setCode(newCode);


        //
    }

    ////////////////

    const renderChoices = () => {
        const currentQuestion = questions[currentQuestionIndex];
        const choices = ['a', 'b', 'c', 'd'];

        return choices.map((choice) => (
            <div className="form-check" key={choice}>
                <input
                    type="radio"
                    className="form-check-input"
                    id={`choice-${choice}`}
                    name="choice"
                    value={choice}
                    checked={(currentQuestion.user_choice == choice && selectedChoice == null) || selectedChoice === choice}
                    onChange={() => handleChoiceSelect(choice)}
                />
                <label className="form-check-label" htmlFor={`choice-${choice}`}>
                    <strong>{choice.toUpperCase()})</strong> {currentQuestion[`choice_${choice}`].replace('```go\n', '').replace('```', '')}
                </label>
                {((currentQuestion.user_choice == choice  && selectedChoice == null)|| selectedChoice === choice) && (
                    <span className={isChoiceCorrect(choice) ? 'badge bg-success ms-2' : 'badge bg-danger ms-2'}>
            {isChoiceCorrect(choice) ? 'True' : 'Wrong'}
          </span>
                )}
            </div>
        ));
    };

    const renderExplanation = () => {
        if (showExplanation) {
            const currentQuestion = questions[currentQuestionIndex];
            const questionExplanation = currentQuestion.explanation.String.replace('```go\n', '').replace('```', '');
            const santized = DOMPurify.sanitize(questionExplanation)
            if(!setNotCode && currentQuestion.code.String != "") {
                setCode(currentQuestion.code)
            }
            return (
                <div className="alert alert-info mt-3 ScrollBar">
                    <strong>Explanation:</strong><br></br>
                    <div dangerouslySetInnerHTML={{ __html:  santized }} />
                    {explanation == "" &&
                        <button className={"btn-more-explanation"} onClick={()=> fetchExplanation(currentQuestion) }>Give more explanation...</button>
                    }
                    <div id="explanation">{explanation}</div>
                </div>
            );
        }
        return null;
    };

    const Question = () => {

        let question = ""

        if (!questions || questions.length === 0 ) { // || currentQuestionIndex >= questions.length
            return false;// <p>Error in loading Question!!!</p>;

        }

        if (currentQuestionIndex === -1)
            setCurrentQuestionIndex(0)

        const currentQuestion = questions[currentQuestionIndex !== 0 ? currentQuestionIndex : 0];
        setTopic(currentQuestion.topic)
        question = currentQuestion.question

        let c = ''

        if (!setNotCode) {
            let questionCode = currentQuestion.question_code.String;
            if (questionCode.length != 0 && language.id == 1) {
                if (questionCode.indexOf("package") < 0) {
                    questionCode = "package main\n\nfunc main(){\n" + questionCode + "\n}"
                }
                setCode(questionCode)
            }
        }

        const sanitizedQuestion = DOMPurify.sanitize(question);

        return (
            <div className="book-page container mt-4 new-line"
                 /*ref={el => {
                     if (el) {
                         el.style.setProperty('margin', '-6px', 'important');
                     }
                 }}*/>
                <div className={'question-choices ScrollBar'}>
                    <h5>{currentQuestion.id}) <span dangerouslySetInnerHTML={{ __html:  sanitizedQuestion }} /></h5>
                    <form className={'question-form'}>
                        {renderChoices()}
                    </form>
                </div>
                <div className="d-flex justify-content-between">
                    <button className="btn btn-secondary mt-3" onClick={handlePreviousQuestion}
                            disabled={currentQuestionIndex === 0}>
                        Previous Question
                    </button>
                    <button className="btn btn-primary mt-3" onClick={handleNextQuestion}
                            disabled={currentQuestionIndex === questions.length - 1}>
                        Next Question
                    </button>
                </div>
                {
                    renderExplanation()
                }
            </div>
        )
            ;
    };

    const RenderEditor = () => {

        const editorStyle = {
            height: '55%',
            color: 'white',
        };

        return (
            <div className="book-page container mt-4 new-line">
                <div className="toolbar">
                    <button disabled={runDisabled} id="runButton" onClick={RunClick}>
                        <i className="fas fa-play"></i> Run
                    </button>
                    <div className="loader hidden" id="loader"></div>
                    {/* <div>
                      <button onClick={() => shareOnLinkedIn()}>Share on LinkedIn</button>
                      <button onClick={() => shareOnTwitter()}>Share on Twitter</button>
                      <button onClick={() => shareOnFacebook()}>Share on Facebook</button>
                      <button onClick={() => shareOnInstagram()}>Share on Instagram</button>
                    </div> */}
                </div>
                <div id='editor-output' style={editorStyle}>
                    <AceEditor
                        id="editor"
                        value={code}
                        mode={language.ace_mode?? "golang"}
                        // theme={selectedMode == 'light' ? "monokai" : "chrome"}
                        onChange={onChangeCode}
                        name="editor"
                        editorProps={{$blockScrolling: true}}
                        fontSize={15}
                        height={'700px!important'}
                        showPrintMargin={true}
                        showGutter={true}
                        highlightActiveLine={true}
                        setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                            enableSnippets: true,
                            showLineNumbers: true,
                            tabSize: 4,
                            theme: `ace/theme/${selectedMode === 'light' ? 'chrome' : 'monokai'}`,
                        }}
                        style={{height: '500px !important'}} // Set the height using the style prop
                    />

                    <pre id='output' className={selectedMode === 'light' ? 'output-light' : 'output-dark'}></pre>
                </div>
                {/*<textarea id="output"  ></textarea>*/}
                {/* value={output} onChange={handleChangeTextarea} */}
            </div>
        )
    };
    const [menuOpen, setMenuOpen] = useState(false);
    const page = props.content;

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };
    useEffect(() => {
        if (page === 'questions') {
            //setSelectedChoice(null)
            setShowExplanation(false)
        }
        if (!token) {
            const token = getUserToken();
            if (token) {
                setToken(token);
            }
        }
        getUser();

    }, [token]);
    const title = page === 'topics'? 'Topic' : page === 'register' ? 'User' : 'Topic';

    const Modal = ({ onClose }) => {
        const handlePrint = () => {
            // Create a new window with the modal content
            const printWindow = window.open('', '_blank');
            printWindow.document.write('<html><head><link rel="stylesheet" href="/print.css" type="text/css"></head><body>');

            // Append the modal content to the print window
            printWindow.document.write(document.querySelector('.modal-content').innerHTML);
            printWindow.document.write('</body></html>');

            printWindow.document.close();
           printWindow.print();
        };

        return (
            <div className="modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <span title={"Close"} className="close" onClick={onClose}>&times;</span>
                        <span className="print-icon" onClick={handlePrint}
                        ><img title={"Print"} width={20}
                                                                                src="/printer.svg"/>
                        </span>

                    </div>
                    {/* Add a container for the table */}
                    <div className="table-container">
                        <Result languages={languages} user={user} userToken={token?.userToken ?? getUserToken() ?? ""}/>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
        <div style={{width: '40px'}}>
                <HamburgerMenu token = {token} logOut = {logOut} selectedMod={selectedMode}
                               showModal={toggleModal}
                               setSelectedMode={(mode) => {
                                   //if(!setNotCode)
                                   setSelectedMode(mode)
                               }}
                               setLanguage = {(language) => {setLanguage(language)
                                   setCode("")
                                   setSetNotCode(false)
                                   fetchQuestions(language)
                                   setSelectedChoice(null)
                               }}
                />
            </div>
            <div className="book">

                {/*<nav className="navbar navbar-expand-lg navbar-light bg-light">
                <button
                    className={`navbar-toggler ${menuOpen ? '' : 'collapsed'}`}
                    type="button"
                    onClick={toggleMenu}
                    aria-controls="menu-collapse"
                    aria-expanded={menuOpen}
                    aria-label="Toggle Menu"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`navbar-collapse ${menuOpen ? 'show' : ''}`} id="menu-collapse">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link to="/topics" className="nav-link">Topics</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/questions" className="nav-link">Questions</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/questions-list" className="nav-link">Questions List</Link>
                        </li>
                    </ul>
                </div>
            </nav>*/}
                {/*<div className="horizontal-menu">*/}
                {/*    <Link to="/topics" className="vertical-menu-item">Topics</Link>*/}
                {/*    <Link to="/" className="vertical-menu-item">Questions</Link>*/}
                {/*    /!*<Link to="/questions-list" className="vertical-menu-item">Questions List</Link>*!/*/}
                {/*</div>*/}
                <div className="book-pages">

                    <div className="page-left">
                        {
                            <>
                                <h4 style={{height: 49}} className="mt-4 mb-3" ref={ref}>
                                    <span style={{width: 100, height: 100, margin: 10 }}>
                                    <img style={{width: language?.width ?? 50}} src={"/"+language?.logo}/></span>
                                    {/*{title}:*/}
                                    <span className='topic'>{topic.toUpperCase()}
                                    </span>
                                </h4>
                                {page === 'questions' &&
                                <Question changeCode={changeCode}/>
                                }
                                {
                                    page === 'register' &&
                                    <Registration />
                                }
                                {
                                    page === 'login' && !token &&
                                    <Login setToken={setUserToken} />
                                }
                                {
                                    page === 'login' && token &&  navigate(`/question/1`, {replace: true})

                                }
                            </>

                        }
                        {page === 'topics' &&
                            <>
                                <TopicList setCurrentQuestionIndex={setCurrentQuestionIndex} questions={questions} languageID = {language.id}/>

                                {/*<QuestionList setCurrentQuestionIndex={setCurrentQuestionIndex} questions={questions}/>*/}
                            </>
                        }
                    </div>
                    <div className="page-right">
                        {page !== 'auth' &&
<>
                            <h4 className="mt-4 mb-3" style={{"paddingBottom":11}}>CODE EDITOR</h4>
                            {RenderEditor()}
</>
                        }

                    </div>
                </div>
            </div>
            {!token && page != 'register' && <Navigate replace={true} to="/login"/>}
            {/*<Result userToken={token?.userToken ?? getUserToken() ?? ""} />*/}
            {/*{showModal && <Result userToken={token?.userToken ?? getUserToken() ?? ""} />}*/}
            {showModal && <Modal onClose={toggleModal} />}
        </>
    );

}

export default QuizPage;
