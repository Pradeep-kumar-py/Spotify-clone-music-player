let currentSong = new Audio();
let songs = [];
let allSongs = [];
let currFolder;
let currentSongIndex = 0;
let currentFolderIndex = 0;

// Function to format time for display
function formatTime(seconds) {
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}



async function fetchAllSongs() {
    let response = await fetch('https://drive.google.com/drive/folders/1VNAn6fZcV4HCPRtvFqs9v549CTFRbjIV?usp=drive_link'); // Fetch directory structure
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let folders = div.getElementsByTagName("a");

    // Iterate through each folder to fetch songs
    for (let folder of folders) {
        const folderName = folder.href.split("/").slice(-2, -1)[0];
        if (folder.href.endsWith("/")) {
            let songsResponse = await fetch(`/https://drive.google.com/drive/folders/1VNAn6fZcV4HCPRtvFqs9v549CTFRbjIV?usp=drive_link/${folderName}/`);
            let songsText = await songsResponse.text();
            let songsDiv = document.createElement("div");
            songsDiv.innerHTML = songsText;
            let songElements = songsDiv.getElementsByTagName("a");

            Array.from(songElements).forEach(song => {
                if (song.href.endsWith(".mp3")) {
                    const songName = song.href.split("/").pop().replaceAll("%20", " ");
                    allSongs.push({ name: songName, folder: folderName });
                }
            });
        }
    }
}


function searchSongs(query) {
    const searchResults = allSongs.filter(song =>
        song.name.toLowerCase().includes(query.toLowerCase())
    );

    displaySearchResults(searchResults);
}

function displaySearchResults(results) {
    const songUl = document.querySelector(".songList ul");
    songUl.innerHTML = ""; // Clear previous search results

    results.forEach(result => {
        let li = document.createElement("li");
        li.innerHTML = `
            <div class="songBorder">
                <img src="svg/music.svg" alt="music icon">
                <div class="songinfo">
                    <div class="songName">${result.name}</div>
                    <div class="artistName">From: ${result.folder}</div>
                </div>
            </div>
            <div class="playNow">
                <div>Play Now</div>
                <img src="svg/play2.svg" alt="">
            </div>
        `;

        // Play song when clicked
        li.addEventListener("click", () => {
            currentSongIndex = 0; // Reset index
            playMusic(result.name, result.folder);
        });

        songUl.appendChild(li);
    });
}



document.querySelector(".search_box").addEventListener("input", (e) => {
    const query = e.target.value.trim();
    searchSongs(query);
});





// Fetch folders and dynamically create divs in the right container
async function fetchFolders() {
    const rightContainer = document.querySelector(".right");
    rightContainer.innerHTML = ""; // Clear existing content

    let response = await fetch('/https://drive.google.com/drive/folders/1VNAn6fZcV4HCPRtvFqs9v549CTFRbjIV?usp=drive_link/'); // Fetch directory structure
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let folders = div.getElementsByTagName("a");
    currentFolderIndex = `${folders[1]}`;
    console.log(currentFolderIndex)
    
    // Filter valid folders and dynamically create a div for each
    Array.from(folders).forEach(folder => {
        const folderName = folder.href.split("/").slice(-2, -1)[0];
        
        // Filter out the server URL and any invalid entries
        if (folder.href.endsWith("/") && !folderName.startsWith("127.0.0.1:3000")) {
            let folderDiv = document.createElement("div");
            folderDiv.classList.add("musicFolder");
            folderDiv.setAttribute("data-folder", folderName);
            folderDiv.innerHTML= `<img src="https://drive.google.com/drive/folders/1VNAn6fZcV4HCPRtvFqs9v549CTFRbjIV?usp=drive_link/${folderName}/image.jpeg" alt="${folderName}"><div class="ArtistName">${folderName.replaceAll("%20"," ")}</div>` ;
            
            rightContainer.appendChild(folderDiv);
            
            // Attach click event listener to load songs on click
            folderDiv.addEventListener("click", () => {
                displaySongs(folderName);
            });
        }
    });
}



// Fetch and display songs in the left container from the selected folder
async function displaySongs(folder) {
    currFolder = folder;
    let songUl = document.querySelector(".songList ul");
    songUl.innerHTML = ""; // Clear previous list

    let response = await fetch(`/https://drive.google.com/drive/folders/1VNAn6fZcV4HCPRtvFqs9v549CTFRbjIV?usp=drive_link/${folder}/`);
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let songElements = div.getElementsByTagName("a");
    songs = []; // Reset songs array

    // Populate song list in the left container
    Array.from(songElements).forEach(song => {
        if (song.href.endsWith(".mp3")) {
            let songName = song.href.split("/").pop().replaceAll("%20", " ");
            songs.push(songName); // Store song for playback controls

            let li = document.createElement("li");
            li.innerHTML = `
                <div class="songBorder">
                    <img src="svg/music.svg" alt="music icon">
                    <div class="songinfo">
                        <div class="songName">${songName}</div>
                        <div class="artistName">Unknown Artist</div>
                    </div>
                </div>
                <div class="playNow">
                    <div>Play Now</div>
                    <img src="svg/play2.svg" alt="">
                </div>
            `;
            songUl.appendChild(li);

            // Play song on click
            li.addEventListener("click", () => {
                currentSongIndex = songs.indexOf(songName); // Update current song index
                playMusic(songName, folder);
            });
        }
    });
}

// Play selected song
function playMusic(track, folder) {
    currFolder = folder;
    currentSong.src = `/https://drive.google.com/drive/folders/1VNAn6fZcV4HCPRtvFqs9v549CTFRbjIV?usp=drive_link/${folder}/${track}`;
    currentSong.play();
    document.querySelector(".music-info").innerHTML = decodeURI(track);
    document.querySelector(".musicTime").innerHTML = "00:00/00:00";
    document.querySelector("#playButton").src = "svg/pause.svg";
}

function prepareMusic(track, folder) {
    currFolder = folder;
    currentSong.src = `/https://drive.google.com/drive/folders/1VNAn6fZcV4HCPRtvFqs9v549CTFRbjIV?usp=drive_link/${folder}/${track}`; // Set the song source
    document.querySelector(".music-info").innerHTML = decodeURI(track); // Display song info
    document.querySelector(".musicTime").innerHTML = "00:00/00:00"; // Reset time display
    document.querySelector("#playButton").src = "svg/play.svg"; // Ensure play icon is shown
}

function resumePlay() {
    // Check if the song is finished
    if (currentSong.currentTime === currentSong.duration) {
        if (currentSongIndex < songs.length - 1) {
            // Move to the next song if available
            currentSongIndex++;
            playMusic(songs[currentSongIndex], currFolder);
        } else {
            // If it's the last song, reset or stop the player
            currentSong.pause();
            currentSong.currentTime = 0;
            document.querySelector("#playButton").src = "svg/play.svg"; // Set to play icon
        }
    }
}


// Next song function
function playNextSong() {
    if (currentSongIndex < songs.length - 1) {
        currentSongIndex++;
        playMusic(songs[currentSongIndex], currFolder);
    }
}

// Previous song function
function playPreviousSong() {
    if (currentSongIndex > 0) {
        currentSongIndex--;
        playMusic(songs[currentSongIndex], currFolder);
    }
}




// Initialize page by loading folders and setting up controls
async function main() {
    await fetchFolders();
    await fetchAllSongs();


    currentSong.addEventListener("ended", resumePlay);

    // await currentFolderIndex();

    
    const rightContainer = document.querySelector(".right");
    const firstFolderDiv = rightContainer.querySelector(".musicFolder");

    if (firstFolderDiv) {
        const firstFolderName = firstFolderDiv.getAttribute("data-folder");

        // Automatically display the first folder's songs
        await displaySongs(firstFolderName);

        // Play the first song in the folder if it exists
        if (songs.length > 0) {
            currentSongIndex = 0; // Set the index to the first song
            // await displaySongs(songs[0])
           prepareMusic(songs[0], firstFolderName); // Play the first song
        }
    }



    
    // Event listener for play/pause button
    document.querySelector("#playButton").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.querySelector("#playButton").src = "svg/pause.svg";
        } else {
            currentSong.pause();
            document.querySelector("#playButton").src = "svg/play.svg";
        }
    });

    // Event listeners for previous and next buttons
    document.querySelector("#previous").addEventListener("click", playPreviousSong);
    document.querySelector("#next").addEventListener("click", playNextSong);

    // Time update event for the current song
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".musicTime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    currentSong.addEventListener("timeupdate", ()=>{
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".musicTime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        const progress = (currentSong.currentTime/currentSong.duration)*100 + "%";
        document.querySelector(".circle").style.left = progress;
        // document.querySelector(".seekBar").value = progress;
        document.querySelector(".seekBar").style.background = `linear-gradient(to right, #ff0000 ${progress}, #ffffff ${progress})`;
    })


    // Seek bar functionality
    document.querySelector(".seekBar").addEventListener("click", (e) => {
        const rect = e.target.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });


    // Add event listionar to hamburger

    function toggleHamburger() {
        const leftMenu = document.querySelector(".left");
        if (leftMenu.style.left === "-100%") {
            leftMenu.style.left = "0";
        } else {
            leftMenu.style.left = "-100%";
        }
    }
    
    // Add event listener only once during setup
    document.querySelector(".hamburger").addEventListener("click", toggleHamburger);

    
}

main();
