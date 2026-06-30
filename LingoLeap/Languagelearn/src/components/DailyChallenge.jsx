import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const questions = [
  { question: "What is the Italian word for 'Hello'?", options: ["Bonjour", "Ciao", "Hallo", "Konnichiwa"], answer: "Ciao" },
  { question: "What is the French word for 'Thank you'?", options: ["Danke", "Merci", "Grazie", "Arigato"], answer: "Merci" },
  { question: "What is the German word for 'Goodbye'?", options: ["Adieu", "Auf Wiedersehen", "Addio", "Sayonara"], answer: "Auf Wiedersehen" },
  { question: "What is the Japanese word for 'Yes'?", options: ["Oui", "Ja", "Hai", "Si"], answer: "Hai" },
  { question: "What is the Italian word for 'Please'?", options: ["Bitte", "Per favore", "S'il vous plaît", "Onegaishimasu"], answer: "Per favore" },
  { question: "What is the French word for 'Water'?", options: ["Eau", "Acqua", "Wasser", "Mizu"], answer: "Eau" },
  { question: "What is the German word for 'Bread'?", options: ["Brot", "Pain", "Pane", "Pan"], answer: "Brot" },
  { question: "What is the Japanese word for 'Friend'?", options: ["Ami", "Freund", "Amico", "Tomodachi"], answer: "Tomodachi" },
  { question: "What is the Italian word for 'Night'?", options: ["Notte", "Nuit", "Nacht", "Yoru"], answer: "Notte" },
  { question: "What is the French word for 'Apple'?", options: ["Mela", "Apfel", "Pomme", "Ringo"], answer: "Pomme" },
];

function DailyChallenge() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerClick = (option) => {
    if (selectedAnswer !== null) return; 

    setSelectedAnswer(option);
    if (option === questions[currentQuestion].answer) {
      setScore(score + 2);
    }
    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null); 
      } else {
        setQuizCompleted(true);
      }
    }, 1000); 
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg text-center">
        {!quizCompleted ? (
          <>
            <h2 className="text-xl font-bold mb-4">{questions[currentQuestion].question}</h2>
            <div className="space-y-2">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition-all ${
                    selectedAnswer === option
                      ? option === questions[currentQuestion].answer
                        ? "bg-green-500"
                        : "bg-red-500"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  onClick={() => handleAnswerClick(option)}
                  disabled={selectedAnswer !== null} 
                >
                  {option}
                </button>
              ))}
            </div>
            <p className="text-gray-600 mt-4">Score: {score}</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
            <p className="text-lg mb-4">Your final score: {score}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default DailyChallenge;
