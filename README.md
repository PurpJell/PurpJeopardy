# PurpJeopardy

PurpJeopardy is an interactive quiz game built with Electron, Express, and WebSockets. It allows multiple players to join and participate in a quiz game hosted on a local network.

Note that this game is hosted localy over LAN, therefore all the participants have to be in close proximity to play!
Also note that the application was built for the Chrome browser, using other browsers may cause unexpected issues.

## Features

- Up to 4 players or teams can play at once
- A host is required to play the game
- Host and player mobile device interfaces
- Customizable questions and categories
- Easy-to-use board builder
- Score tracking
- Language selection between English and Lithuanian
- Background music
- Real-time updates using WebSockets
- CSS and JavaScript animations
- Automated and easily changeable IP address settings

## Upcoming Features

- Sound effects
- Reconnecting mid-game as a player

## Usage for general users

1. **Download the newest release:**

    Download `PurpJeopardy.Setup.<version_number>.exe`, `PurpJeopardy.Setup.<version_number>.exe.blockmap` and `latest.yml` from
    [Releases](https://github.com/PurpJell/PurpJeopardy/releases/latest)

2. **Install the program:**

    Run `PurpJeopardy.Setup.<version_number>.exe`.

3. **Launch the game:**

    Launch the game that should be located in your specified install location (AppData/Local/Programs/PurpJeopardy by default) or you can launch it via desktop shortcut.

4. **Create a lobby:**

    Press the Play button in the app to create a lobby so that players can join.

5. **Connect as a player:**

    On your mobile device open your browser and navigate to `http://<your_ip_address>:3000/` to join as a player.  
    \**note that every device has to be connected to the same network to be able to connect to the game*  
    \**also note that the ip address can be found in the lobby screen after pressing the play button in the app and changed in the settings*

6. **Connect as a host:**

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

2. **Create a lobby:**

    Press the Play button in the app to create a lobby so that players can join.

3. **Open the host interface:**

    On your mobile device open your browser and navigate to `http://<your_ip_address>:3000/host`.  
    \**note that every device has to be connected to the same network*

4. **Open the player interface:**

    On your mobile device open your browser and navigate to `http://<your_ip_address>:3000/` to join as a player.  
    \**note that every device has to be connected to the same network*

5. **Building the application** (optional)**:** 

    ```bash
    npm run build
    ```

## License

This project is licensed under a Custom License. See the [LICENSE](./LICENSE) file for details.

## Acknowledgements

- [Electron](https://www.electronjs.org/)
- [Express](https://expressjs.com/)
- [WebSocket](https://www.npmjs.com/package/ws)

This project uses the following fonts:

- [Atma](https://fonts.google.com/specimen/Atma)
- [Chewy](https://fonts.google.com/specimen/Chewy)
- [Winky Sans](https://fonts.google.com/specimen/Winky+Sans)
- [Lilita One](https://fonts.google.com/specimen/Lilita+One)
- [Bangers](https://fonts.google.com/specimen/Bangers)
- [Cherry Bomb One](https://fonts.google.com/specimen/Cherry+Bomb+One)
- [Coiny](https://fonts.google.com/specimen/Coiny)
- [DynaPuff](https://fonts.google.com/specimen/DynaPuff)
- [LuckiestGuy](https://fonts.google.com/specimen/Luckiest+Guy)

[View the licenses](./fonts/licenses/).

This project uses the following music tracks:

- "Gimme All I Want (Instrumental)" by Anthem of Rain licensed under CC BY 4.0. Source: [Free Music Archive](https://freemusicarchive.org/music/anthem-of-rain/freedom/gimme-all-i-want-instrumental/).
- "City Line" by Beat Mekanik licensed under CC BY 4.0. Source: [Free Music Archive](https://freemusicarchive.org/music/beat-mekanik/single/city-line/).
- "Mastermath" by Beat Mekanik licensed under CC BY 4.0. Source: [Free Music Archive](https://freemusicarchive.org/music/beat-mekanik/single/mastermath/).
- "Game" by Chad Crouch licensed under CC BY-NC 4.0. Source: [Free Music Archive](https://freemusicarchive.org/music/Chad_Crouch/Jams/Game_1525/).
- "Proton Beat" by Gangi licensed under CC BY 3.0. Source: [Free Music Archive](https://freemusicarchive.org/music/Gangi/Bonus_Beat_Blast_2011/22_gangi-proton_beat/).
- "Abducted" by HoliznaCC0 licensed under CC0 1.0. Source: [Free Music Archive](https://freemusicarchive.org/music/holiznacc0/beats-from-the-crypt/abducted/).
- "Dream Pop" by HoliznaCC0 licensed under CC0 1.0. Source: [Free Music Archive](https://freemusicarchive.org/music/holiznacc0/only-in-the-milky-way-part-3/dream-pop/).
- "Dreamers" by HoliznaCC0 licensed under CC0 1.0. Source: [Free Music Archive](https://freemusicarchive.org/music/holiznacc0/forager/dreamers/).
- "Thoughts Growing Mold" by HoliznaCC0 licensed under CC0 1.0. Source: [Free Music Archive](https://freemusicarchive.org/music/holiznacc0/forager-pt-2/thoughts-growing-mold/).
- "Lost In The Rythm" by HoliznaCC0 licensed under CC0 1.0. Source: [Free Music Archive](https://freemusicarchive.org/music/holiznacc0/lost/lost-in-the-rythm/).
- "Peaking Through The Curtain Inst" by HoliznaRAPS licensed under CC BY 4.0. Source: [Free Music Archive](https://freemusicarchive.org/music/holiznaraps/peaking-through-the-curtain/peaking-through-the-curtain-inst/).
- "PTSD (Instrumental)" by HoliznaRAPS licensed under CC BY 4.0. Source: [Free Music Archive](https://freemusicarchive.org/music/holiznaraps/ptsd/ptsd-instrumental-2/).
- "Dollar Theatre" by Jalen Warshawsky licensed under CC BY 3.0. Source: [Free Music Archive](https://freemusicarchive.org/music/Jalen_Warshawsky/Bonus_Beat_Blast_2011/31_jalen_warshawsky-dollar_theatre/).
- "Bird" by James Pants licensed under CC BY 3.0. Source: [Free Music Archive](https://freemusicarchive.org/music/James_Pants/Bonus_Beat_Blast_2011/33_james_pants-bird/).
- "Fate" by Masteredit licensed under CC BY-SA 4.0. Source: [Free Music Archive](https://freemusicarchive.org/music/masteredit/golden-scorpion/fate-1/).
- "Final Judgement" by Masteredit licensed under CC BY-SA 4.0. Source: [Free Music Archive](https://freemusicarchive.org/music/masteredit/golden-scorpion/final-judgement/).
- "International" by Masteredit licensed under CC BY-SA 4.0. Source: [Free Music Archive](https://freemusicarchive.org/music/masteredit/golden-scorpion/international/).
- "Sixth Floor" by Paweł Feszczuk licensed under CC BY 4.0. Source: [Free Music Archive](https://freemusicarchive.org/music/pawel-feszczuk/walking-next-to-the-playing-piano/sixth-floor/).
- "Sunny Walk" by Paweł Feszczuk licensed under CC BY 4.0. Source: [Free Music Archive](https://freemusicarchive.org/music/pawel-feszczuk/walking-next-to-the-playing-piano/sunny-walk/).
- "Duckbag" by Wake licensed under CC BY 3.0. Source: [Free Music Archive](https://freemusicarchive.org/music/Wake/Bonus_Beat_Blast_2011/67_wake-duckbag/).

[View the licenses](./audio/licenses/).