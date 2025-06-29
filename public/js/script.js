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
           const { latitude, longitude, accuracy }= position.coords;
             socket.emit("send-location", {latitude, longitude, accuracy, name: userName});
        }, (error) => {
            console.error("Error getting location:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 2000, // lower timeout for more frequent updates
            maximumAge: 0 // do not use cached position
        }
      );
    }

    const map = L.map("map").setView([0, 0], 18); // Start with higher zoom

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "raj makwana map"
    }).addTo(map);

    const marker = {};
    let firstLocation = true;
    let accuracyCircle = {};

    socket.on("receive-location", (data) => {
        const { name, latitude, longitude, accuracy } = data;
        // Only zoom to your own location the first time
        if (name === userName && firstLocation) {
            map.setView([latitude, longitude], 18);
            firstLocation = false;
        }
        if(marker[name]) {
            marker[name].setLatLng([latitude, longitude]);
            marker[name].bindPopup((name || "Unknown") + (accuracy ? `<br>Accuracy: ${accuracy}m` : ""));
            if (accuracyCircle[name]) {
                accuracyCircle[name].setLatLng([latitude, longitude]);
                accuracyCircle[name].setRadius(accuracy || 10);
            }
        }
        else{
            marker[name] = L.marker([latitude, longitude]).addTo(map)
                .bindPopup((name || "Unknown") + (accuracy ? `<br>Accuracy: ${accuracy}m` : "")).openPopup();
            accuracyCircle[name] = L.circle([latitude, longitude], {
                radius: accuracy || 10,
                color: 'blue',
                fillColor: '#30f',
                fillOpacity: 0.2
            }).addTo(map);
        }
    });
}