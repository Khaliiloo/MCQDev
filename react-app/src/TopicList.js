import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import './TopicList.css';
const TopicList = (props) => {
    const [topics, setTopics] = useState([]);
    const languageID = props.languageID;
    useEffect(() => {
        fetchTopics(languageID);
    }, [languageID]);

    const fetchTopics = async (languageID) => {
        try {console.log('http://localhost:5000/api/topics/' + languageID)
            const response = await fetch('http://localhost:5000/api/topics/' + languageID); // Replace with your backend API endpoint to fetch topics
            const data = await response.json();
            setTopics(data);

        } catch (error) {
            console.error('Error fetching topics:', error);
        }
    };

    return (
        <div className="topic-list-container">
            <h2 className="topic-list-title">Topics</h2>
            <table className="scroll-down">
                <thead>
                <tr>
                    <th>
                        Topic
                    </th>
                    <th>
                        Number of Questions
                    </th>
                </tr>
                </thead>
                {/*<ul className="topic-list">*/}
                <tbody>
                {topics.map((topic) => (

                    /* <li key={topic.question_id} className="topic-list-item">
                         {/!* Create a link to the first question of each topic *!/}

                         <Link to={`/question/${topic.question_id}`} className="topic-link">
                             {topic.topic}
                         </Link>
                     </li>*/
                    <tr key={topic.question_id} className="topic-list-item">
                        {/* Create a link to the first question of each topic */}
                        <td>
                            <Link to={`/question/${topic.question_id}`} onClick={() => {props.setCurrentQuestionIndex(topic.question_id - 1);}} className="topic-link">
                                {topic.topic}
                            </Link>
                        </td>
                        <td className="topic-link">
                            {topic.number_of_questions}
                        </td>
                    </tr>
                ))}
                {/*</ul>*/}
                </tbody>
            </table>
        </div>
    );
};

export default TopicList;
