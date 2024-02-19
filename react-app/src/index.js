import React from 'react';
import ReactDOM from 'react-dom/client';
// import { BrowserRouter as Router } from 'react-router-dom';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import QuestionList from "./QuestionList";
import './index.css';
//import App from './App';
import QuizPage from './QuizPage';
import Registration from "./Registration";
import Login from "./Login";
import reportWebVitals from './reportWebVitals';
import TopicList from "./TopicList";
import AuthPage from "./AuthPage";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Router>
        <Routes>
            {/* Route for the QuizPage with questionId as a parameter */}
            <Route path="/questions" path="/question/:questionId" element={<QuizPage content={'questions'}/>}>

            </Route>
            {/* Route for other components (if any) */}
            <Route path="/questionList"  element={<QuestionList/>}>
            </Route>

            <Route path="/" element={<QuizPage content={'topics'}/>}>

            </Route>

            <Route path="/topics" element={<QuizPage content={'topics'}/>}>

            </Route>
            <Route path="/register" element={<QuizPage content={'register'}/>}>
            </Route>
            <Route path="/login" element={<QuizPage content={'login'}/>}>
            </Route>
            <Route path="/auth" element={<AuthPage />}>
            </Route>

        </Routes>
    </Router>
    // <React.StrictMode>
    //   <QuizPage />
    // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
