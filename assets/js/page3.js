document.addEventListener('DOMContentLoaded', function() {
    // Airtable API configuration
    const apiKey = 'patltA4bs1xjUB0EV.ff4082999c1ddee3a0dbb0a497fd56a78666bb9debe065803f4b241b2db02baa';
    const baseId = 'appRON7cSA3jKt3cW';

    const fetchDataAndInitializeSlider = (tableName, containerId) => {
        axios.get(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
            params: { maxRecords: 100, view: 'Grid view' }
        })
        .then(response => {
            const records = response.data.records;
            records.forEach(record => {
                addCardToSlider(record.fields, record.id, containerId, tableName);
            });
            initializeSwiper(containerId);
            setLinksToOpenInNewTab();
            startPolling(tableName, containerId); // Start polling for updates
        })
        .catch(error => {
            console.error('Error fetching data from Airtable:', error);
        });
    };

    const addCardToSlider = (fields, recordId, containerId, tableName) => {
        // Create a new card element
        var card = document.createElement('article');
        card.className = 'card__article swiper-slide';
        card.setAttribute('data-record-id', recordId);
        card.setAttribute('data-table-name', tableName);

        // Add card content
        card.innerHTML = `
            <div class="card__image">
                <img src="${fields.image[0].url}" alt="image" class="card__img">
                <div class="card__shadow"></div>
            </div>
            <div class="card__data">
                <h3 class="card__name"><center>${fields.name}</center></h3>
                <p class="card__location">
                    <img src="assets/img/location.png" alt="Location Icon" class="location-icon">
                    ${fields.location}
                </p>
                <p class="card__participant">Participants : <span class="participant-count">${fields.participants}</span>/12
                </p>
                <a href="${fields.link}" class="card__button">S'inscrire</a>
                <p class="card__description">${fields.description}</p>
                <p class="card__organisateur"><b><u>Animateurs :</b></u> <i>${fields.animateurs}</i></p>
            </div>
        `;

        // Append the card to the swiper wrapper
        document.querySelector(`#${containerId} .swiper-wrapper`).appendChild(card);

        // Handle the S'inscrire button click event
        const button = card.querySelector('.card__button');
        const participantCountElement = card.querySelector('.participant-count');
        let participantCount = parseInt(participantCountElement.textContent, 10);

        function updateButtonState() {
            if (participantCount >= 12) {
                button.style.backgroundColor = '#df1e26';
                button.style.border = 'none';
                button.textContent = 'Complet';
                button.classList.add('disabled');
                button.setAttribute('disabled', true);
            } else {
                button.style.backgroundColor = '';
                button.style.border = '';
                button.textContent = "S'inscrire";
                button.classList.remove('disabled');
                button.removeAttribute('disabled');
            }
        }

        button.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the default action

            const modal = document.getElementById("validationModal");
            const span = document.getElementsByClassName("close")[0];
            const confirmButton = document.getElementById("confirmButton");
            const cancelButton = document.getElementById("cancelButton");

            const workshopName = card.querySelector('.card__name').innerText;
            document.getElementById('modalTitle').innerText = `Inscription à l'Atelier ${workshopName}`;
            document.getElementById('modalText').innerText = 'Je valide mon inscription à cet atelier.';

            modal.style.display = "block";

            confirmButton.onclick = function() {
                modal.style.display = "none";
                if (participantCount < 12) {
                    participantCount++;
                    participantCountElement.textContent = participantCount;
                    updateButtonState();

                    // Update the participant count in Airtable
                    axios.patch(`https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}`, {
                        fields: {
                            participants: participantCount
                        }
                    }, {
                        headers: { Authorization: `Bearer ${apiKey}` }
                    })
                    .then(() => {
                        // Navigate to the link
                        window.location.href = button.href;
                    })
                    .catch(error => {
                        console.error('Error updating participant count in Airtable:', error);
                        // Revert the UI update if the backend update fails
                        participantCount--;
                        participantCountElement.textContent = participantCount;
                        updateButtonState();
                    });
                } else {
                    alert('Le nombre maximum de participants a été atteint.');
                }
            };

            cancelButton.onclick = function() {
                modal.style.display = "none";
            };

            span.onclick = function() {
                modal.style.display = "none";
            };

            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            };
        });

        updateButtonState();
    };

    const initializeSwiper = (containerId) => {
        // Initialize Swiper after adding cards to the DOM
        let swiperCards = new Swiper(`#${containerId} .card__content`, {
            loop: false,
            spaceBetween: 32,
            grabCursor: true,
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
                dynamicBullets: true,
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            breakpoints: {
                600: {
                    slidesPerView: 2,
                },
                968: {
                    slidesPerView: 3,
                },
            },
        });
    };

    const setLinksToOpenInNewTab = () => {
        // Get all anchor elements
        var links = document.getElementsByTagName('a');

        // Loop through all anchor elements
        for (var i = 0; i < links.length; i++) {
            // Set the target attribute to _blank
            links[i].setAttribute('target', '_blank');
        }
    };

    // Function to poll server for updates
    const pollServerForUpdates = (tableName, containerId) => {
        axios.get(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
            params: { maxRecords: 100, view: 'Grid view' }
        })
        .then(response => {
            const records = response.data.records;
            records.forEach(record => {
                const card = document.querySelector(`.card__article[data-record-id="${record.id}"]`);
                if (card) {
                    const participantCountElement = card.querySelector('.participant-count');
                    const newParticipantCount = record.fields.participants;
                    participantCountElement.textContent = newParticipantCount;

                    const button = card.querySelector('.card__button');
                    if (newParticipantCount >= 12) {
                        button.style.backgroundColor = '#df1e26';
                        button.style.border = 'none';
                        button.textContent = 'Complet';
                        button.classList.add('disabled');
                        button.setAttribute('disabled', true);
                    } else {
                        button.style.backgroundColor = '';
                        button.style.border = '';
                        button.textContent = "S'inscrire";
                        button.classList.remove('disabled');
                        button.removeAttribute('disabled');
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error polling data from Airtable:', error);
        });
    };

    // Start polling at regular intervals
    const startPolling = (tableName, containerId) => {
        setInterval(() => {
            pollServerForUpdates(tableName, containerId);
        }, 5000); // Poll every 5 seconds
    };

    // Fetch data and initialize sliders
    fetchDataAndInitializeSlider('j2_creneau_1', 'slider1');
    fetchDataAndInitializeSlider('j2_creneau_2', 'slider2');
    fetchDataAndInitializeSlider('j2_creneau_3', 'slider3');
    fetchDataAndInitializeSlider('j2_creneau_4', 'slider4');

    // Toggle card description on touch-enabled devices
    document.querySelectorAll('.card__article').forEach((card) => {
        card.addEventListener('click', () => {
            // Check if the device is touch-enabled
            if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
                const description = card.querySelector('.card__description');
                description.style.display = description.style.display === 'block' ? 'none' : 'block';
            }
        });
    });

    // Ensure all links open in a new tab
    setLinksToOpenInNewTab();
});
