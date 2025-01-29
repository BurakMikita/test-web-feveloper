import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, Button } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';

// Pokémon object with name and color
const pokemons = [
	{ name: "Bulbasaur", color: "black" },
	{ name: "Charmander", color: "orange" },
	{ name: "Squirtle", color: "blue" },
	{ name: "Pikachu", color: "yellow" },
];

const PlayPage = () => {
	const { state } = useLocation();
	const navigate = useNavigate();

	const { map, mapSize } = state;

	const sizes = {
		small: { width: 10, height: 10 },
		medium: { width: 25, height: 20 },
		large: { width: 40, height: 25 },
	};

	const { width, height } = sizes[mapSize];

	const centerX = Math.floor(width / 2);
	const centerY = Math.floor(height / 2);

	const isWater = (x, y) => {
		const index = y * width + x;
		return map[index] === "water";
	};

	const findNearestLand = (startX, startY) => {
		const visited = new Set();
		const directions = [
			{ dx: 0, dy: -1 }, // up
			{ dx: 0, dy: 1 },  // down
			{ dx: -1, dy: 0 }, // left
			{ dx: 1, dy: 0 },  // right
		];

		const queue = [{ x: startX, y: startY, distance: 0 }];

		while (queue.length > 0) {
			const { x, y } = queue.shift();

			if (isWater(x, y)) continue;

			if (map[y * width + x] !== "water") {
				return { x, y };
			}

			for (const { dx, dy } of directions) {
				const newX = x + dx;
				const newY = y + dy;

				if (
					newX >= 0 && newX < width &&
					newY >= 0 && newY < height &&
					!visited.has(`${newX},${newY}`)
				) {
					visited.add(`${newX},${newY}`);
					queue.push({ x: newX, y: newY, distance: 0 });
				}
			}
		}

		return { x: startX, y: startY };
	};

	const { x: startX, y: startY } = isWater(centerX, centerY)
		? findNearestLand(centerX, centerY)
		: { x: centerX, y: centerY };

	const [playerPos, setPlayerPos] = useState({ x: startX, y: startY });
	const [pokemonPos, setPokemonPos] = useState(null);
	const [pokemon, setPokemon] = useState(null);
	const [caughtPokemons, setCaughtPokemons] = useState([]);
	const [message, setMessage] = useState(null);
	const [victoryMessage, setVictoryMessage] = useState(null);
	const [startTime] = useState(Date.now());
	const [pokemonTimeout, setPokemonTimeout] = useState(null);


	const saveGameState = () => {
		localStorage.setItem('playerPos', JSON.stringify(playerPos));
		localStorage.setItem('map', JSON.stringify(map));
		localStorage.setItem('caughtPokemons', JSON.stringify(caughtPokemons));
	};

	const loadGameState = () => {
		const savedPlayerPos = localStorage.getItem('playerPos');
		const savedCaughtPokemons = localStorage.getItem('caughtPokemons');
		const savedMap = localStorage.getItem('map');

		if (savedPlayerPos) setPlayerPos(JSON.parse(savedPlayerPos));
		if (savedCaughtPokemons) setCaughtPokemons(JSON.parse(savedCaughtPokemons));
	};

	useEffect(() => {
		loadGameState();
	}, []);

	useEffect(() => {
		saveGameState();
	}, [playerPos, caughtPokemons]);

	const generatePokemon = () => {
		if (caughtPokemons.length >= 4) return;
	  
		const remainingPokemons = pokemons.filter(p => !caughtPokemons.includes(p));
		const randomPokemon = remainingPokemons[Math.floor(Math.random() * remainingPokemons.length)];
	  
		if (Math.random() <= 0.2) {
		  const landPositions = [];
		  for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
			  if (!isWater(x, y)) {
				landPositions.push({ x, y });
			  }
			}
		  }
	  
		  if (landPositions.length > 0 && randomPokemon) {
			const randomPosition = landPositions[Math.floor(Math.random() * landPositions.length)];
			setPokemonPos(randomPosition);
			setPokemon(randomPokemon);
	  
			// Запускаем таймер на 3 секунды
			const timeoutId = setTimeout(() => {
			  setPokemonPos(null);
			  setPokemon(null);
			}, 3000);
	  
			// Сохраняем идентификатор таймера для его очистки, если игрок успеет поймать покемона
			setPokemonTimeout(timeoutId);
		  }
		}
	  };

	const handleKeyDown = (event) => {
		const { x, y } = playerPos;

		let newX = x;
		let newY = y;

		if (event.key === "ArrowUp" && y > 0) newY = y - 1;
		if (event.key === "ArrowDown" && y < height - 1) newY = y + 1;
		if (event.key === "ArrowLeft" && x > 0) newX = x - 1;
		if (event.key === "ArrowRight" && x < width - 1) newX = x + 1;

		if (isWater(newX, newY)) return;

		setPlayerPos({ x: newX, y: newY });

		if (map[newY * width + newX] === "grass" && !pokemon) {
			generatePokemon();
		}
	};

	useEffect(() => {
		if (playerPos.x === pokemonPos?.x && playerPos.y === pokemonPos?.y && pokemon) {
		  setCaughtPokemons([...caughtPokemons, pokemon]);
		  setMessage(`You caught ${pokemon.name}!`);
		  setPokemon(null);
		  setPokemonPos(null);
	  
		  // Очищаем таймер, если покемон был пойман
		  if (pokemonTimeout) {
			clearTimeout(pokemonTimeout);
			setPokemonTimeout(null);
		  }
	  
		  setTimeout(() => {
			setMessage(null);
		  }, 2000);
		}
	  }, [playerPos, pokemonPos, caughtPokemons, pokemon, pokemonTimeout]);

	  useEffect(() => {
		return () => {
		  if (pokemonTimeout) {
			clearTimeout(pokemonTimeout);
		  }
		};
	  }, [pokemonTimeout]);

	useEffect(() => {
		if (caughtPokemons.length === 4) {
			const endTime = Date.now();
			const timeTaken = Math.floor((endTime - startTime) / 1000);
			setVictoryMessage(`Congratulations! You caught all Pokémon in ${timeTaken} seconds.`);
		}
	}, [caughtPokemons, startTime]);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [playerPos]);

	const exportGameState = () => {
		const gameState = {
			playerPos,
			map,
			caughtPokemons,
		};

		const blob = new Blob([JSON.stringify(gameState, null, 2)], { type: "application/json" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "game_state.json";
		link.click();
	};

	const handleRestart = () => {
		localStorage.clear(); // Clear local storage
		navigate("/"); // Navigate to the home page (or main page)
	};


	return (
		<div>
			<Button
				variant="contained"
				color="secondary"
				onClick={exportGameState}
				style={{ marginBottom: "20px" }}
			>
				Export Game State
			</Button>
			<Button
				variant="contained"
				color="secondary"
				onClick={handleRestart}
				style={{ marginBottom: "20px", marginLeft: "20px" }}
			>
				Restart
			</Button>
			<h1>Play Page</h1>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: `repeat(${width}, 20px)`,
					gap: "2px",
					marginTop: "20px",
				}}
			>
				{map.map((cell, index) => {
					const x = index % width;
					const y = Math.floor(index / width);
					const isPlayer = x === playerPos.x && y === playerPos.y;
					const isPokemon = pokemonPos && x === pokemonPos.x && y === pokemonPos.y;

					return (
						<div
							key={index}
							style={{
								width: "20px",
								height: "20px",
								backgroundColor:
									cell === "water"
										? "blue"
										: cell === "grass"
											? "green"
											: cell === "land"
												? "brown"
												: "transparent",
								border: "1px solid black",
								position: "relative",
							}}
						>
							{isPlayer && (
								<Avatar
									sx={{
										position: "absolute",
										top: "50%",
										left: "50%",
										width: "30px",
										height: "30px",
										transform: "translate(-50%, -50%)",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										backgroundColor: "transparent",
									}}
								>
									<PersonIcon sx={{ fontSize: "20px", color: "red" }} />
								</Avatar>
							)}
							{isPokemon && pokemon && (
								<Avatar
									sx={{
										position: "absolute",
										top: "50%",
										left: "50%",
										width: "30px",
										height: "30px",
										transform: "translate(-50%, -50%)",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										backgroundColor: "transparent",
									}}
								>
									<CatchingPokemonIcon sx={{ fontSize: "28px", color: pokemon.color }} />
								</Avatar>
							)}
						</div>
					);
				})}
			</div>

			{/* Caught Pokémon Message */}
			{message && (
				<div
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						backgroundColor: "rgba(0, 0, 0, 0.6)",
						color: "white",
						padding: "10px",
						borderRadius: "5px",
						fontSize: "18px",
					}}
				>
					{message}
				</div>
			)}

			{/* Victory Message */}
			{victoryMessage && (
				<div
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						backgroundColor: "rgba(0, 128, 0, 0.6)",
						color: "white",
						padding: "10px",
						borderRadius: "5px",
						fontSize: "20px",
					}}
				>
					{victoryMessage}

					<Button
						variant="contained"
						onClick={handleRestart}
						style={{
							marginBottom: "20px",
							marginLeft: "20px",
							display: "flex",
							justifyContent: "center",  // Центрирует кнопку
							margin: "0 auto",  // Центрирует по горизонтали
						}}
					>
						Restart
					</Button>
				</div>
			)}

			{/* Display caught Pokémon */}
			<h2>Caught Pokémon</h2>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Icon</th>
						<th>Color</th>
					</tr>
				</thead>
				<tbody>
					{caughtPokemons.map((caughtPokemon, index) => (
						<tr key={index}>
							<td>{caughtPokemon.name}</td>
							<td>
								<CatchingPokemonIcon sx={{ fontSize: "20px", color: caughtPokemon.color }} />
							</td>
							<td>{caughtPokemon.color}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default PlayPage;
