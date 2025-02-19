# PurpJeopardy

PurpJeopardy is an interactive quiz game built with Electron, Express, and WebSockets. It allows multiple players to join and participate in a quiz game hosted on a local network.

Note that this game is hosted localy over LAN, therefore some non-beginner-friendly steps are required to setup the game correctly.

## Features

- Host and player interfaces
- Real-time updates using WebSockets
- Customizable questions and categories
- Score tracking

## Game Features

- Up to 4 players or teams can play at once
- A host is required to play the game

## Upcoming Features

- Easy-to-use board builder
- Player card background customization
- Sound effects and music
- Reconnecting mid-game
- Visual overhaul

## Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/PurpJell/PurpJeopardy.git
    cd PurpJeopardy
    ```

2. **Find your IPv4 address:**

    ```bash
    ipconfig
    ```

3. **Save your IPv4 address as an environment variable:**

    ```bash
    setx IP_ADDRESS "<your_ip_address>"
    ```

4. **Install dependencies:**

    ```bash
    npm install
    ```

5. **Download the fonts** (Recommended)**:**

    Follow the instructions in the Fonts section to download and install the free fonts used in the game.

## Usage for general users

0. **Build the game** (You only need to do this once)**:**

    ```bash
    npm run build
    ```

    \**note that this also opens the game, so you can skip step 1.*

1. **Run the game:**

    Locate the game files (they are usually located at `C:\Users\<username>\AppData\Local\Programs\purpjeopardy`)
    Run PurpJeopardy.exe

2. **Connect as the host:**

    On your mobile device open your browser and navigate to `http://<your_ip_address>:3000/host`.
    \**note that every device has to be connected to the same network*

3. **Connect as a player:**

    On your mobile device open your browser and navigate to `http://<your_ip_address>:3000/` to join as a player.
    \**note that every device has to be connected to the same network*

## Usage for developers

1. **Start the application:**

    ```bash
    npm start
    ```

2. **Open the host interface:**

    On your mobile device open your browser and navigate to `http://<your_ip_address>:3000/host`.
    \**note that every device has to be connected to the same network*

3. **Open the player interface:**

    On your mobile device open your browser and navigate to `http://<your_ip_address>:3000/` to join as a player.
    \**note that every device has to be connected to the same network*

4. **Building the application** (optional)**:** 

    ```bash
    npm run build
    ```

## Fonts

This project uses custom fonts that are not included in the repository. You will need to download and install these fonts yourself.

1. Download the fonts from the following links:
   - [Mono Polz](https://www.dafont.com/mono-polz.font)
   - [Naturaly](https://www.dafont.com/naturaly.font)

2. Install the fonts on your system.

3. Place the font files in the `fonts` directory of the project.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

- [Electron](https://www.electronjs.org/)
- [Express](https://expressjs.com/)
- [WebSocket](https://www.npmjs.com/package/ws)
- [www.dafont.com](https://www.dafont.com/)
