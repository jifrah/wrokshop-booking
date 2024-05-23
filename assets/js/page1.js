document.addEventListener('DOMContentLoaded', function() {
    // Airtable API configuration
    const apiKey = 'patltA4bs1xjUB0EV.ff4082999c1ddee3a0dbb0a497fd56a78666bb9debe065803f4b241b2db02baa';
    const baseId = 'appRON7cSA3jKt3cW';

    const fetchDataAndInitializeSlider = (tableName, containerId) => {
        axios.get(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
            params: { maxRecords: 20, view: 'Grid view' }
        })
        .then(response => {
            const records = response.data.records;
            records.forEach(record => {
                addCardToSlider(record.fields, record.id, containerId, tableName);
            });
            initializeSwiper(containerId);
        })
        .catch(error => {
            console.error('Error fetching data from Airtable:', error);
        });
    };

    const addCardToSlider = (fields, recordId, containerId, tableName) => {
        // Create a new card element
        var card = document.createElement('article');
        card.className = 'card__article swiper-slide';
    
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
                <p class="card__participant">Participants : <span class="participant-count">${fields.participants}</span>/14
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
            if (participantCount >= 14) {
                button.style.backgroundColor = 'red';
                button.textContent = 'Complete';
                button.classList.add('disabled');
                button.setAttribute('disabled', true);
            }
        }
    
        button.addEventListener('click', (event) => {
            if (participantCount < 14) {
                participantCount++;
                participantCountElement.textContent = participantCount;
    
                // Update the participant count in Airtable
                axios.patch(`https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}`, {
                    fields: {
                        participants: participantCount
                    }
                }, {
                    headers: { Authorization: `Bearer ${apiKey}` }
                })
                .then(() => {
                    updateButtonState();
                })
                .catch(error => {
                    console.error('Error updating participant count in Airtable:', error);
                });
            } else {
                // Prevent the default action (navigation) if the count is 14 or more
                event.preventDefault();
            }
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

    // Fetch data and initialize sliders
    fetchDataAndInitializeSlider('j1_creneau_1', 'slider1');
    fetchDataAndInitializeSlider('j1_creneau_2', 'slider2');

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
});