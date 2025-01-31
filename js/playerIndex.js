document.addEventListener('DOMContentLoaded', function() {
    const playerPicture = document.getElementById('playerPicture');
    const playerName = document.getElementById('playerName');
    const joinGameButton = document.getElementById('joinGameButton');
    const playerImageInput = document.createElement('input');
    const loadingScreen = document.getElementById('loadingScreen');
    playerImageInput.type = 'file';
    playerImageInput.accept = 'image/*';
    playerImageInput.style.display = 'none';
    document.body.appendChild(playerImageInput);

    loadingScreen.style.display = 'none';

    let ip_address = '';

    // Fetch the IP address from the server
    fetch('/get-ip-address')
        .then(response => response.json())
        .then(data => {
            ip_address = data.ipAddress;
        })
        .catch(error => alert('Error fetching IP address:', error));


    let playerData = JSON.parse(localStorage.getItem('playerData')) || {};

    // If player data exists, display the last player's name and image
    if (playerData.name) {
        playerPicture.src = playerData.imgSrc;
        playerName.value = playerData.name;
    }

    // Add event listener to player image input
    playerImageInput.addEventListener('change', function() {
        const file = playerImageInput.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            playerPicture.src = event.target.result; // Display the selected image
        };
        reader.readAsDataURL(file);
    });

    // Add event listener to player picture to trigger file input
    playerPicture.addEventListener('click', function() {
        playerImageInput.click();
    });

    // Add event listener to join game button
    joinGameButton.addEventListener('click', function() {

        // Display loading screen
        loadingScreen.style.display = 'flex';

        const playerNameValue = playerName.value;
        const playerImgSrc = playerPicture.src;
        const currentPlayerData = { name: playerNameValue, imgSrc: playerImgSrc, score: 0 };
        // Overwrite the last player's data if it exists
        playerData = currentPlayerData;
        localStorage.setItem('playerData', JSON.stringify(playerData));

        fetch(`http://${ip_address}:3000/addPlayer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentPlayerData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = `http://${ip_address}:3000/buzzer`;
            } else {
                alert("failed: ", data.message);
                loadingScreen.style.display = 'none'; // Hide loading screen on error
            }
        })
        .catch(error => {
            alert('Error: failed to join lobby ', error);
            loadingScreen.style.display = 'none'; // Hide loading screen on error
        });
    });
});