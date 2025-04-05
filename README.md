# PurpJeopardy

PurpJeopardy is an interactive quiz game built with Electron, Express, and WebSockets. It allows multiple players to join and participate in a quiz game hosted on a local network.

Note that this game is hosted localy over LAN, therefore all the participants have to be in close proximity to play!

## Features

- Up to 4 players or teams can play at once
- A host is required to play the game
- Host and player mobile device interfaces
- Customizable questions and categories
- Easy-to-use board builder
- Score tracking
- Language selection between English and Lithuanian
- Real-time updates using WebSockets
- CSS and JavaScript animations

## Upcoming Features

- Sound effects and music
- Reconnecting mid-game

## Usage for general users

1. **Download the newest release:**

    *Add link here*.

2. **Install the program:**

    Run `PurpJeopardy Setup <version_number>.exe`.

3. **Launch the game:**

    The game should be located in your specified install location (AppData/Local/Programs/PurpJeopardy by default) or launch the game via desktop shortcut.

4. **Connect as a player:**

    On your mobile device open your browser and navigate to `http://<your_ip_address>:3000/` to join as a player.  
    \**note that every device has to be connected to the same network to be able to connect to the game*  
    \**also note that the ip address can be found in the lobby screen after pressing the play button in the app*

5. **Connect as a host:**

    On your mobile device open your browser and navigate to `http://<your_ip_address>:3000/host`.  
    \**note that every device has to be connected to the same network to be able to connect to the game*


## Prerequisites for developers

- [Node.js](https://nodejs.org/) (LTS version recommended)
- Git (optional, for cloning the repository)
- Chrome browser (some parts of the project might not work on other browsers)

## Setup for developers

1. **Clone the repository:**

    ```bash
    git clone https://github.com/PurpJell/PurpJeopardy.git
    cd PurpJeopardy
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

## Usage for developers

1. **Start the application:**

    ```bash
    npm start
    ```

2. **Open the host interface:**

    On your mobile device open your browser and navigate to `http://<your_ip_address>:3000/host`.  
    \**note that every device has to be connected to the same network*

4. **Open the player interface:**

    On your mobile device open your browser and navigate to `http://<your_ip_address>:3000/` to join as a player.  
    \**note that every device has to be connected to the same network*

5. **Building the application** (optional)**:** 

    ```bash
    npm run build
    ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

- [Electron](https://www.electronjs.org/)
- [Express](https://expressjs.com/)
- [WebSocket](https://www.npmjs.com/package/ws)
- [Atma](https://fonts.google.com/specimen/Atma)
- [Chewy](https://fonts.google.com/specimen/Chewy)
- [Winky Sans](https://fonts.google.com/specimen/Winky+Sans)
- [Lilita One](https://fonts.google.com/specimen/Lilita+One)