import React, { useState, useEffect } from 'react';
import './Result.css'; // Import CSS file for styling

const Result = (props) => {
    const [results, setResults] = useState([]);
    const languages = props.languages;

    useEffect(() => {
        // Fetch data when component mounts
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch data from your API or database
            const response = await fetch('http://localhost:5000/api/results/'+props.userToken);
            const data = await response.json();
            console.log(languages)
            // Mock data for demonstration
            // const data = [
            //     { language_id: 1, language_name: 'English', topic: 'Topic 1', user_question_count: 10, total_question_count: 20, user_question_percentage: 50, correct_answers_count: 8, correct_answers_percentage: 40 },
            //     { language_id: 1, language_name: 'English', topic: 'Topic 2', user_question_count: 15, total_question_count: 25, user_question_percentage: 60, correct_answers_count: 12, correct_answers_percentage: 48 },
            //     { language_id: 2, language_name: 'Spanish', topic: 'Topic 1', user_question_count: 8, total_question_count: 15, user_question_percentage: 53.33, correct_answers_count: 7, correct_answers_percentage: 46.67 },
            //     // Add more data as needed
            // ];

            // Set the fetched data to the component state
            setResults(data.results);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
console.log("props", props);
    return (
        <div className="result-container">
            <div className="image-container">
            <img width={50} src={"/logo-color.png"}/>
            </div>
            <h3>MCQ Dev: <i><b>{props.user}</b></i> Results</h3>
            {results.length > 0 && (
                <table className="result-table">
                    <thead>
                    <tr>
                        <th>Language</th>
                        <th className={'topicText'}>Topic</th>
                        <th>User Question Count</th>
                        <th>Total Question Count</th>
                        <th>User Question %</th>
                        <th>Correct Answers Count</th>
                        <th>Correct Answers %</th>
                        <th>Questions Count</th>
                        <th>Total Correct Answers %</th>
                    </tr>
                    </thead>
                    <tbody>
                    {results.map((result, index) => (
                        <tr key={index}>
                            {index === 0 || results[index - 1].language_id !== result.language_id ? (
                                <td rowSpan={results.filter((res) => res.language_id === result.language_id).length}>
                                    {/*{result.language_name}*/}
                                    <img style={{width: languages[result.language_id - 1].width}}
                                         src={"/" + languages[result.language_id - 1].logo}/>
                                </td>
                            ) : null}
                            <td className={'topicText'}>{result.topic}</td>
                            <td>{result.user_answers_count}</td>
                            <td>{result.total_question_count}</td>
                            <td>{result.user_answers_percentage.toFixed(2)}%</td>
                            <td>{result.correct_answers_count}</td>
                            <td>{result.correct_answers_percentage.toFixed(2)}%</td>
                            {index === 0 || results[index - 1].language_id !== result.language_id ? (
                                <td rowSpan={results.filter((res) => res.questions_count === result.questions_count).length}>
                                    {result.questions_count}
                                </td>
                            ) : null}
                            {index === 0 || results[index - 1].language_id !== result.language_id ? (
                                <td rowSpan={results.filter((res) => res.total_correct_answers_percentage === result.total_correct_answers_percentage).length}>
                                    {result.total_correct_answers_percentage.toFixed(2)}%
                                </td>
                            ) : null}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Result;
