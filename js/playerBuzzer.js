document.addEventListener('DOMContentLoaded', function() {
    const playerPicture = document.getElementById('playerPicture');
    const playerName = document.getElementById('playerName');
    const playerScore = document.getElementById('playerScore');
    const buzzerButton = document.getElementById('buzzer');

    let ip_address = '';

    // Fetch the IP address from the server
    fetch('/get-ip-address')
        .then(response => response.json())
        .then(data => {
            ip_address = data.ipAddress;
            setupWebSocket(ip_address);
        })
        .catch(error => alert('Error fetching IP address:', error));

    let playerData = JSON.parse(localStorage.getItem('playerData')) || {};

    function setupWebSocket(ip_address_) {
        socket = new WebSocket(`ws://${ip_address_}:8080/buzzer`);

        socket.onmessage = function(event) {
            const message = JSON.parse(event.data);
            if (message.type === 'correctAnswer' && message.data.name === playerData.name) {
                playerData.score += parseInt(message.data.price);
                localStorage.setItem('playerData', JSON.stringify(playerData));
                playerScore.textContent = `$${playerData.score}`;
            } else if (message.type === 'incorrectAnswer' && message.data.name === playerData.name) {
                playerData.score -= parseInt(message.data.price);
                localStorage.setItem('playerData', JSON.stringify(playerData));
                playerScore.textContent = `$${playerData.score}`;
            }
        };

        socket.onclose = function() {
            console.log('WebSocket connection closed');
        };
    }

    // If player data exists, display the last player's name and image
    if (playerData) {;
        playerPicture.src = playerData.imgSrc;
        playerName.innerHTML = playerData.name;

        if (playerData.name.length < 6) {
            playerName.style.fontSize = '14vw';
            playerName.style.marginTop = '2vw';
        } else if (playerData.name.length < 11) {
            playerName.style.fontSize = '10.5vw';
            playerName.style.marginTop = '2.5vw';
        }

        playerScore.textContent = `$${playerData.score}`;
    }

    // Add event listener to buzzer button
    buzzerButton.addEventListener('click', function() {
        fetch(`http://${ip_address}:3000/buzzer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(playerData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // alert('Buzzer pressed successfully');
                } else {
                    alert('Error pressing buzzer');
                }
            })
            .catch(error => alert('Error pressing buzzer:', error));
    });

});
