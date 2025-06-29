const socket = io();

// Prompt user for their name
let userName = prompt("Enter your name:");
if (!userName || userName.trim() === "") {
    alert("Name is required to use the live map.");
    // Optionally, hide the map container if it exists
    const mapDiv = document.getElementById("map");
    if (mapDiv) mapDiv.style.display = "none";
} else {
    // Only run the rest of the code if a name is provided
    if(navigator.geolocation) {
        navigator.geolocation.watchPosition((position) => {
           const { latitude, longitude }= position.coords;
             socket.emit("send-location", {latitude, longitude, name: userName});
        }, (error) => {
            console.error("Error getting location:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
      );
    }

    const map = L.map("map").setView([0, 0], 18); // Start with higher zoom

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "raj makwana map"
    }).addTo(map);

    const marker = {};
    let firstLocation = true;

    socket.on("receive-location", (data) => {
        const { name, latitude, longitude } = data;
        // Only zoom to your own location the first time
        if (name === userName && firstLocation) {
            map.setView([latitude, longitude], 18);
            firstLocation = false;
        }
        if(marker[name]) {
            marker[name].setLatLng([latitude, longitude]);
            marker[name].bindPopup(name || "Unknown");
        }
        else{
            marker[name] = L.marker([latitude, longitude]).addTo(map)
                .bindPopup(name || "Unknown").openPopup();
        }
    });
}