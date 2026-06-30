import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Practice() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [questionLimit, setQuestionLimit] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [totalPoints, setTotalPoints] = useState(() => {
    return parseInt(localStorage.getItem('totalPoints')) || 0;
  });
  const [showTryAgainModal, setShowTryAgainModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 

  useEffect(() => {
    if (questionLimit !== null) {
      setLoading(true); 
      setError(null); 
      axios
        .get(`http://localhost:5000/api/practice-questions?limit=${questionLimit}`)
        .then((response) => {
          setQuestions(response.data);
          setFilteredQuestions(response.data);
        })
        .catch((error) => {
          setError('Failed to load questions. Please try again later.');
        })
        .finally(() => {
          setLoading(false); 
        });
    }
  }, [questionLimit]);

  useEffect(() => {
    localStorage.setItem('totalPoints', totalPoints);
  }, [totalPoints]);

  const startQuiz = () => {
    setQuizStarted(true);
    setScore(0);
    setCurrentQuestion(0);
    setIsAnswered(false);
  };

  const selectQuestionLimit = (limit) => {
    setQuestionLimit(limit);
  };

  const handleOptionClick = (option) => {
    if (!isAnswered) {
      setSelectedOption(option);
      setIsAnswered(true);
      if (option === filteredQuestions[currentQuestion].answer) {
        setScore(score + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setTotalPoints((prevPoints) => prevPoints + score);
      setShowTryAgainModal(true);
    }
  };

  const handleTryAgain = (shouldTryAgain) => {
    if (shouldTryAgain) {
      setShowTryAgainModal(false);
      setQuestionLimit(null);
    } else {
      setShowTryAgainModal(false);
      setQuizStarted(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-500 to-blue-500 min-h-screen flex">
      <div className="w-1/5 bg-green-900 h-screen sticky top-0 flex flex-col items-start p-6 space-y-6 rounded-r-3xl shadow-lg">
        <h1 className="text-white font-bold text-2xl mb-4">LingoLeap</h1>
        <ul className="space-y-4 w-full">
          <li className="text-white hover:bg-green-700 p-2 rounded-lg w-full"><Link to="/dashboard">Home</Link></li>
          <li className="text-white hover:bg-green-700 p-2 rounded-lg w-full"><Link to="/practice">Practice</Link></li>
          <li className="text-white hover:bg-green-700 p-2 rounded-lg w-full"><Link to="/leaderboard">Leaderboard</Link></li>
          <li className="text-white hover:bg-green-700 p-2 rounded-lg w-full"><Link to="/profile">Profile</Link></li>
        </ul>
      </div>

      <div className="w-4/5 flex flex-col p-6">
        {!quizStarted ? (
          <div className="flex flex-col items-center">
            <h2 className="text-white font-bold text-lg mb-4">Start Practice Quiz</h2>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded" onClick={startQuiz}>
              Start Quiz
            </button>
          </div>
        ) : questionLimit === null ? (
          <div className="flex flex-col items-center">
            <h2 className="text-white font-bold text-lg mb-4">Select Number of Questions</h2>
            <div className="grid grid-cols-3 gap-4">
              {[10, 20, 30, 40, 50].map((limit) => (
                <button key={limit} className="bg-green-600 rounded-lg p-4 text-white hover:bg-green-500 cursor-pointer" onClick={() => selectQuestionLimit(limit)}>
                  {limit}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="text-white">Loading questions...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div> 
            ) : (
              <>
                <h2 className="text-white font-bold text-lg mb-4">Practice Quiz</h2>
                <p className="text-white mb-4">{filteredQuestions[currentQuestion]?.question}</p>
                <div className="grid grid-cols-2 gap-4">
                  {filteredQuestions[currentQuestion]?.options.map((option, index) => (
                    <button key={index} className={`bg-green-600 rounded-lg p-4 text-white hover:bg-green-500 cursor-pointer ${isAnswered && option === filteredQuestions[currentQuestion].answer ? 'bg-blue-500' : isAnswered && option === selectedOption ? 'bg-red-500' : ''}`} onClick={() => handleOptionClick(option)}>
                      {option}
                    </button>
                  ))}
                </div>
                {isAnswered && (
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded mt-4" onClick={handleNextQuestion}>
                    {currentQuestion === filteredQuestions.length - 1 ? "Finish Quiz" : "Next Question"}
                  </button>
                )}
                {currentQuestion === filteredQuestions.length - 1 && isAnswered && (
                  <p className="text-white mt-4">Final Score: {score} / {filteredQuestions.length}</p>
                )}
              </>
            )}
          </>
        )}
      </div>

      {showTryAgainModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">Do you want to try again?</h3>
            <div className="flex justify-around">
              <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-500" onClick={() => handleTryAgain(true)}>
                Yes
              </button>
              <button className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-500" onClick={() => handleTryAgain(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Practice;
