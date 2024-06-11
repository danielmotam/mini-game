import React, { useState, useEffect, useRef } from 'react';
import ReactAudioPlayer from 'react-audio-player';

const Game = () => {
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isGameOver, setIsGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [ranking, setRanking] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [pressedKeys, setPressedKeys] = useState([]); 
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);

  useEffect(() => {
    const generateSequence = () => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let seq = [];
      for (let i = 0; i < 10; i++) {
        seq.push(letters[Math.floor(Math.random() * letters.length)]);
      }
      return seq;
    };
    setSequence(generateSequence());
  }, []);

  useEffect(() => {
    if (!isGameOver) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            setIsGameOver(true);
            setMessage('Tempo esgotado! Você perdeu.');
            clearInterval(timer);
            return 0;
          }
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isGameOver]);

  useEffect(() => {
    if (currentIndex === sequence.length && sequence.length > 0) {
      setIsGameOver(true);
      setMessage('Parabéns! Você venceu!');
      setScore(timeLeft * 10);
      setRanking(prevRanking => [...prevRanking, { score: timeLeft * 10, date: new Date().toISOString() }]);
    }
  }, [currentIndex, sequence.length, timeLeft]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!isGameOver && event.key.toUpperCase() === sequence[currentIndex]) {
        setCurrentIndex(prevIndex => prevIndex + 1);
        setFeedback('correct');
        setPressedKeys(prevKeys => [...prevKeys, event.key.toUpperCase()]); 
          correctSoundRef.current.audioEl.current.play();
        }
      } else if (!isGameOver && event.key.toUpperCase() !== sequence[currentIndex]) {
        setIsGameOver(true);
        setMessage('Tecla errada! Você perdeu.');
        setFeedback('wrong');
        if (wrongSoundRef.current) {
          wrongSoundRef.current.audioEl.current.play();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentIndex, isGameOver, sequence]);

  const handleRestart = () => {
    setSequence([]);
    setCurrentIndex(0);
    setTimeLeft(30);
    setIsGameOver(false);
    setMessage('');
    setScore(0);
    setFeedback('');
    setPressedKeys([]); 
    const generateSequence = () => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let seq = [];
      for (let i = 0; i < 10; i++) {
        seq.push(letters[Math.floor(Math.random() * letters.length)]);
      }
      return seq;
    };
    setSequence(generateSequence());
  };

  return (
    <div className="game-container">
      <h1>Minigame de Sequência de Teclas</h1>
      <div className="game-active">
        <h2>Pressione a sequência:</h2>
        <div className="sequence">
          {sequence.map((char, index) => (
            <span
              key={index}
              className={`sequence-char ${pressedKeys.includes(char) ? 'pressed' : ''} ${index === currentIndex ? 'current' : ''}`}
            >
              {char}
            </span>
          ))}
        </div>
        <h3>Tempo restante: {timeLeft} segundos</h3>
        {isGameOver && (
          <div className="game-over">
            <h2>{message}</h2>
            <h3>Sua pontuação: {score}</h3>
            <button onClick={handleRestart}>Reiniciar Jogo</button>
            <h3>Ranking:</h3>
            <ul>
              {ranking.sort((a, b) => b.score - a.score).map((item, index) => (
                <li key={index}>{item.date}: {item.score} pontos</li>
              ))}
            </ul>
          </div>
        )}
        {feedback && (
          <div className={`feedback ${feedback}`}>
            {feedback === 'correct' ? 'Correto!' : 'Errado!'}
          </div>
        )}
      </div>
      <ReactAudioPlayer
        src="/sounds/correct.mp3"
        ref={correctSoundRef}
        preload="auto"
      />
      <ReactAudioPlayer
        src="/sounds/wrong.mp3"
        ref={wrongSoundRef}
        preload="auto"
      />
      <style jsx>{`
        .game-container {
          text-align: center;
          margin-top: 50px;
        }
        .sequence {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }
        .sequence-char {
          padding: 5px;
          font-size: 24px;
          transition: color 0.3s, transform 0.3s;
        }
        .sequence-char.current {
          color: red;
          transform: scale(1.2);
        }
        .sequence-char.pressed {
            color: green;
        }

        .feedback {
          margin-top: 20px;
          font-size: 20px;
          transition: opacity 0.3s;
        }
        .feedback.correct {
          color: green;
          opacity: 1;
        }
        .feedback.wrong {
          color: red;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default Game;
