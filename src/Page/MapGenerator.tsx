import React, { useState, useEffect } from "react";
import { Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

const MapGenerator = () => {
  const [mapSize, setMapSize] = useState("small");
  const [waterPercent, setWaterPercent] = useState(10);
  const [grassPercent, setGrassPercent] = useState(10);
  const [map, setMap] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Состояние для загрузки
  const navigate = useNavigate();

  const sizes = {
    small: { width: 10, height: 10 },
    medium: { width: 25, height: 20 },
    large: { width: 40, height: 25 },
  };

  useEffect(() => {
    generateMap();
  }, [mapSize, waterPercent, grassPercent]);

  const generateMap = () => {
    setIsLoading(true); // Начинаем загрузку

    const { width, height } = sizes[mapSize];
    const totalCells = width * height;
    const waterCells = Math.floor((waterPercent / 100) * totalCells);
    const grassCells = Math.floor((grassPercent / 100) * totalCells);

    let tempMap = new Array(totalCells).fill("land");

    const getIndex = (x, y) => y * width + x;

    const placeWater = () => {
      let placed = 0;
      let centerX = Math.floor(Math.random() * width);
      let centerY = Math.floor(Math.random() * height);

      tempMap[getIndex(centerX, centerY)] = "water";
      placed++;

      let radius = 1;
      while (placed < waterCells) {
        for (let dx = -radius; dx <= radius; dx++) {
          for (let dy = -radius; dy <= radius; dy++) {
            let newX = centerX + dx;
            let newY = centerY + dy;
            let newIndex = getIndex(newX, newY);

            if (
              newX >= 0 &&
              newX < width &&
              newY >= 0 &&
              newY < height &&
              tempMap[newIndex] === "land"
            ) {
              let distance = Math.sqrt(dx * dx + dy * dy);
              if (distance <= radius) {
                tempMap[newIndex] = "water";
                placed++;
                if (placed >= waterCells) break;
              }
            }
          }
          if (placed >= waterCells) break;
        }
        radius++;
      }
    };

    const placeGrass = () => {
      let placed = 0;
      while (placed < grassCells) {
        let index = Math.floor(Math.random() * totalCells);
        if (tempMap[index] === "land") {
          tempMap[index] = "grass";
          placed++;
        }
      }
    };

    placeWater();
    placeGrass();

    setMap(tempMap);
    setIsLoading(false); // Завершаем загрузку
  };

  const handlePlayClick = () => {
    // Очистить localStorage перед переходом на страницу
    localStorage.clear();

    // Navigate to the play page and pass map data via state
    navigate("/play", { state: { map, mapSize, caughtPokemons: [] } });
  };



  const importGameState = (file) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const gameState = JSON.parse(reader.result as any);
         console.log(gameState)
        // Проверка на валидность данных
        if (gameState && gameState.map && Array.isArray(gameState.map)) {
          setMap(gameState.map);
          setMapSize(gameState.mapSize || "small");
		 

		  localStorage.setItem('playerPos', JSON.stringify(gameState.playerPos));
		  localStorage.setItem('map', JSON.stringify( gameState.map));
		  localStorage.setItem('caughtPokemons', JSON.stringify(gameState.caughtPokemons));

          navigate("/play", {
            state: {
              map: gameState.map,
              mapSize: gameState.mapSize || "small",
              caughtPokemons: gameState.caughtPokemons || [],
              playerPos: gameState.playerPos || { x: 0, y: 0 }
            },
          });
        } else {
          alert("Invalid game state file!");
        }
      } catch (error) {
        alert("Failed to load game state!");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div>
      <h1>Map Generator</h1>

      {/* Лоадер, если карта генерируется */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          <div>
            <label>Map Size: </label>
            <select value={mapSize} onChange={(e) => setMapSize(e.target.value)}>
              <option value="small">Small (10x10)</option>
              <option value="medium">Medium (25x20)</option>
              <option value="large">Large (40x25)</option>
            </select>
          </div>
          <div>
            <label>Water (%): </label>
            <input
              type="number"
              value={waterPercent}
              min="10"
              max="30"
              onChange={(e) => setWaterPercent(Number(e.target.value))}
            />
          </div>
          <div>
            <label>Grass (%): </label>
            <input
              type="number"
              value={grassPercent}
              min="10"
              max="30"
              onChange={(e) => setGrassPercent(Number(e.target.value))}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${sizes[mapSize].width}, 20px)`,
              gap: "2px",
              marginTop: "20px",
            }}
          >
            {map.map((cell, index) => (
              <div
                key={index}
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor:
                    cell === "water" ? "blue" : cell === "grass" ? "green" : "brown",
                  border: "1px solid black",
                }}
              ></div>
            ))}
          </div>

          <Button
            variant="contained"
            color="primary"
            onClick={handlePlayClick}
            style={{ marginTop: "20px" }}
          >
            Play
          </Button>

          {/* Кнопка импорта состояния игры */}
          <input
            type="file"
            accept=".json"
            onChange={(e) => importGameState(e.target.files[0])}
            style={{ marginTop: "20px" }}
          />
        </>
      )}
    </div>
  );
};

export default MapGenerator;
