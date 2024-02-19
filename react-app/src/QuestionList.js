import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom'; // Import Link from React Router

const QuestionList = (props) => {

    const [questions, setQuestions] = useState([])
    /*const fetchQuestions = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/questions'); // Replace with your backend API endpoint
            const data = await response.json();
            setQuestions(data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };
    useEffect(() => {
        fetchQuestions()
    },[]);*/
    props.setCurrentQuestionIndex(0);
    console.log(props.questions)
    return (
        <div>
            <h2>Question List</h2>
            <ul style={{ height:200, overflow: "auto"}}>
                {props.questions.map((question) => (
                    <li key={question.id}>
                        {/* Create a link to the QuizPage with the question ID as a parameter */}
                        <Link to={`/question/${question.id}`}>{question.topic}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default QuestionList;
